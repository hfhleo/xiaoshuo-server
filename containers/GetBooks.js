
const charset = require('superagent-charset');
const superagent = require('superagent');
charset(superagent);
const request = require('request');

const iconv = require("iconv-lite")
var urlencode = require('urlencode');

/////////规则配置
const Rules = require('./Rules');
/////////解析结构文件
const Analysis = require('./Analysis');

function left_zero_4(str) {
    if (str != null && str != '' && str != 'undefined') {
        if (str.length == 2) {
            return '00' + str;
        }
    }
    return str;
}
function unicode(str) {
    var value = '';
    for (var i = 0; i < str.length; i++) {
        value += '\\u' + left_zero_4(parseInt(str.charCodeAt(i)).toString(16));
    }
    return value;
}


let pad = function (number, length, pos) {
    var str = "%" + number;
    while (str.length < length) {
        //向右边补0
        if ("r" == pos) {
            str = str + "0";
        } else {
            str = "0" + str;
        }
    }
    return str;
}
let toHex = function (chr, padLen) {
    if (null == padLen) {
        padLen = 2;
    }
    return pad(chr.toString(16), padLen);
}
function chinese2Gb2312(data) {
    var gb2312 = iconv.encode(data.toString('UCS2'), 'GB2312');
    var gb2312Hex = "";
    for (var i = 0; i < gb2312.length; ++i) {
        gb2312Hex += toHex(gb2312[i]);
    }
    return gb2312Hex.toUpperCase();
}


//搜索书籍
const searchBook = async (option) => {
    //发送的参数
    let ops = option.ops;
    let oldname = ops.name;
    //获取当前时间
    let start = Date.now(),
        url = Rules.qidian.search.url(ops),
        //搜索需要判断请求的方式
        method = Rules.qidian.search.method,
        //post发送的数据,必须是json字符串
        formData = '',
        headers = option.headers,
        charset = "utf8";
    console.log('-----', ops.sourceType)
    //判断搜索url源头
    for (key in Rules) {
        if (ops.sourceType == key) {
            method = Rules[key].search.method;
            //encodeURI转换
            ops.name = !!Rules[key].search.encodeURI ? encodeURI(ops.name) : ops.name;
            //unicode转换
            ops.name = !!Rules[key].search.unicode ? unicode(ops.name) : ops.name;
            ops.name = !!Rules[key].search.encodeURI_GBK ? urlencode(ops.name, 'gbk') : ops.name;
            //合并请求头
            headers = Object.assign({}, headers, Rules[key].search.headers());

            url = Rules[key].search.url(ops);

            formData = Rules[key].search.formData(ops);
            // formData = formData==""? "": "\'"+JSON.stringify(formData).split("\\").join("")+"\'";
            formData = formData == "" ? "" : formData;

            charset = !!Rules[key].search.domRules.charset.value ? Rules[key].search.domRules.charset.value : "utf8";
        };
    };

    console.log('search formData: ', formData)
    let p1 = function () {
        return new Promise(function (resolve, reject) {
            if (method == "POST") {
                request.post({ url, form: formData, headers }, function (err, httpResponse, body) {
                    if (err) {
                        ////站点错误
                        console.log(err)
                        resolve({ status: -1 })
                    } else {
                        //console.log('状态码'+ JSON.stringify(httpResponse))
                        console.log('内容' + body);
                        //return false;
                        resolve({
                            status: httpResponse.statusCode,
                            text: body
                        })
                    }
                })
            } else {
                superagent(method, url).set(headers).charset(charset).set('accept', 'json').send(formData).end(function (err, res) {
                    if (err) {
                        ////站点错误
                        console.log(err)
                        resolve({ status: -1 })
                    } else {
                        console.log('状态码' + JSON.stringify(res))
                        resolve({
                            status: res.statusCode,
                            text: res.text
                        })
                    }

                });
            }
        });
    }
    let reptile = await p1();
    //请求失败，比如站点有问题
    if (reptile.status != 200) {
        return {
            status: -1,
            url: option.url,
            time: Date.now() - start,
            result: []
        }
    }
    //解析抓取内容
    let result = await Analysis.anaSearch(reptile.text, ops.sourceType, ops.name);

    return {
        status: result.status,
        url: option.url,
        time: Date.now() - start,
        result: result.data,
        charset: result.charset
    }
};
//详细信息只有在起点获取,不做分类判断
const getBookinfo = async (option) => {
    //获取当前时间
    let start = Date.now();
    ////////使用同步操作请求多个
    var nowBook = new Promise(function (resolve, reject) {
        superagent.get(Rules.qidian.info.url(option.ops)).set(option.headers).end(function (err, res) {
            if (err) { resolve({ status: -1 }) } else {
                resolve({ status: res.statusCode, text: res.text })
            }

        });
    })
    var comment = new Promise(function (resolve, reject) {
        //前20条评论
        superagent.get(Rules.qidian.comment.url(option.ops)).set(option.headers).end(function (err, res) {
            if (err) { resolve({ status: -1 }) } else {
                resolve({ status: res.statusCode, text: res.text })
            }

        });
    });
    ///////同步发两个请求
    let results = await Promise.all([nowBook, comment]);
    //请求失败，比如站点有问题
    if (results[0].status != 200 || results[1].status != 200) {
        return {
            status: -1,
            url: option.url,
            time: Date.now() - start,
            result: ""
        }
    }
    /////基本信息
    //解析抓取内容
    var result = await Analysis.anaBookinfo(results[0].text, option.ops.sourceType);

    //评论数据
    var comment = JSON.parse(results[1].text);
    result.data.comment = comment.data.userCount;
    result.data.commentCon = comment.data.commentInfo;

    return {
        status: result.status,
        url: option.url,
        time: Date.now() - start,
        result: result.data
    }
};

//作者其它书籍只有在起点获取,不做分类判断
const getOtherBook = async (option) => {
    //获取当前时间
    let start = Date.now();

    let p1 = function () {
        return new Promise(function (resolve, reject) {
            superagent.get(Rules.qidian.otherBook.url(option.ops)).set(option.headers).end(function (err, res) {
                if (err) { resolve({ status: -1 }) } else {
                    resolve({
                        status: res.statusCode,
                        text: res.text
                    })
                }

            });
        });
    }
    let reptile = await p1();
    //请求失败，比如站点有问题
    if (reptile.status != 200) {
        return {
            status: -1,
            url: option.url,
            time: Date.now() - start,
            result: []
        }
    }

    let result = await Analysis.anaOtherBook(reptile.text, option.ops.sourceType);

    return {
        status: result.status,
        url: option.url,
        time: Date.now() - start,
        result: result.data
    }
};
/////获取文章列表
const getBookList = async (option) => {
    //获取当前时间
    let start = Date.now(),
        url = option.ops.link;


    //起点使用接口
    if (option.ops.sourceType == "qidian") url = Rules.qidian.list.url(option.ops);
    /*for(key in Rules){
        if(option.ops.sourceType == key){
            url = option.ops.link;
        };
    };*/

    let p1 = function () {
        return new Promise(function (resolve, reject) {
            superagent.get(url).set(option.headers).charset(option.charset).end(function (err, res) {
                if (err) { resolve({ status: -1 }) } else {
                    resolve({
                        status: res.statusCode,
                        text: res.text
                    })
                }

            });
        });
    }
    let reptile = await p1();
    //请求失败，比如站点有问题
    if (reptile.status != 200) {
        return {
            status: -1,
            url: option.url,
            time: Date.now() - start,
            result: []
        }
    }
    //解析抓取内容
    let result = await Analysis.anaBookList(reptile.text, option.ops.sourceType, option);

    let dd = result.data;
    dd.charset = option.charset;
    dd.listLink = url;
    //dd.id = option.ops.bid;
    return {
        status: result.status,
        url: url,
        time: Date.now() - start,
        result: dd
    }
};
/////获取文章内容
const getBookDetail = async (option) => {
    //获取当前时间
    let start = Date.now(),
        url = option.ops.link;
    let p1 = function () {
        return new Promise(function (resolve, reject) {
            superagent.get(url).set(option.headers).charset(option.charset).end(function (err, res) {
                if (err) { resolve({ status: -1 }) } else {
                    resolve({
                        status: res.statusCode,
                        text: res.text
                    })
                }

            });
        });
    }
    let reptile = await p1();
    //请求失败，比如站点有问题
    if (reptile.status != 200) {
        return {
            status: -1,
            url: option.ops.url,
            time: Date.now() - start,
            result: ""
        }
    }
    //解析抓取内容
    let result = await Analysis.anaBookDetail(reptile.text, option.ops.sourceType);

    return {
        status: result.status,
        url: option.ops.url,
        time: Date.now() - start,
        result: result.data
    }
};


//作者其它书籍只有在起点获取,不做分类判断
const getHotList = async (option) => {
    //获取当前时间
    let start = Date.now();

    let p1 = function () {
        return new Promise(function (resolve, reject) {
            superagent.get(option.ops.link).set(option.headers).charset(option.charset).end(function (err, res) {
                if (err) { resolve({ status: -1 }) } else {
                    resolve({
                        status: res.statusCode,
                        text: res.text
                    })
                }

            });
        });
    }
    let reptile = await p1();
    //请求失败，比如站点有问题
    if (reptile.status != 200) {
        return {
            status: -1,
            url: option.url,
            time: Date.now() - start,
            result: []
        }
    }
    let result = await Analysis.anaHotList(reptile.text, option.ops.sourceType, option.ops.type);

    return {
        status: result.status,
        url: option.url,
        time: Date.now() - start,
        result: result.data
    }
};

//获取排行
const getRanksBook = async (option) => {
    //获取当前时间
    let start = Date.now();
    let url = Rules.qidian.rankLink(option.ops);
    //是强推
    if (option.ops.type == "qiantui") url = Rules.qidian.qiantuiLink(option.ops);

    let p1 = function () {
        return new Promise(function (resolve, reject) {
            superagent.get(url).set(option.headers).end(function (err, res) {
                if (err) { resolve({ status: -1 }) } else {
                    resolve({
                        status: res.statusCode,
                        text: res.text
                    })
                }

            });
        });
    }
    let reptile = await p1();
    //请求失败，比如站点有问题
    if (reptile.status != 200) {
        return {
            status: -1,
            url: url,
            time: Date.now() - start,
            result: []
        }
    }

    let result = await Analysis.anaRanksBook(reptile.text, option.ops.sourceType, option.ops.type);

    return {
        status: result.status,
        url: url,
        time: Date.now() - start,
        result: result.data
    }
};

//获取类别分类
const getMenus = async (option) => {
    //获取当前时间
    let start = Date.now();
    let url = option.ops.link;

    let p1 = function () {
        return new Promise(function (resolve, reject) {
            superagent.get(url).set(option.headers).end(function (err, res) {
                if (err) { resolve({ status: -1 }) } else {
                    resolve({
                        status: res.statusCode,
                        text: res.text
                    })
                }

            });
        });
    }
    let reptile = await p1();
    //请求失败，比如站点有问题
    if (reptile.status != 200) {
        return {
            status: -1,
            url: url,
            time: Date.now() - start,
            result: []
        }
    }

    let result = await Analysis.anaMenus(reptile.text, option.ops.sourceType, option.ops.type);

    return {
        status: result.status,
        url: url,
        time: Date.now() - start,
        result: result.data
    }
};
//获取分类书籍列表
const getClfBookList = async (option) => {
    //获取当前时间
    let start = Date.now();
    let url = Rules.qidian.clfList.url(option.ops);
    console.log('当前连接' + url);
    let p1 = function () {
        return new Promise(function (resolve, reject) {
            superagent.get(url).set(option.headers).end(function (err, res) {
                if (err) { resolve({ status: -1 }) } else {
                    resolve({
                        status: res.statusCode,
                        text: res.text
                    })
                }

            });
        });
    }
    let reptile = await p1();
    //请求失败，比如站点有问题
    if (reptile.status != 200) {
        return {
            status: -1,
            url: url,
            time: Date.now() - start,
            result: []
        }
    }

    let result = await Analysis.anaClfBookList(reptile.text, option.ops.sourceType);

    return {
        status: result.status,
        url: url,
        time: Date.now() - start,
        result: result.data
    }
};


module.exports = {
    searchBook: searchBook,
    getBookinfo: getBookinfo,
    getOtherBook: getOtherBook,
    getBookList: getBookList,
    getBookDetail: getBookDetail,
    //获取起点强推
    getHotList: getHotList,
    getRanksBook: getRanksBook,
    getMenus: getMenus,
    getClfBookList: getClfBookList,
}