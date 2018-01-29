// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
//import session from "koa2-cookie-session";
const session = require("koa-session2");

// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();

////处理类似表单提交时的内容
const bodyParser = require('koa-bodyparser');



const http = require("http")
const zlib = require("zlib");
const fs = require("fs")

const mongoose = require('./containers/mongoose_connect');

const User = require('./schemas/User')
const Case = require('./schemas/Case')

/////////分离出去抓取请求
const GetBooks = require('./containers/GetBooks');


// 创建一个Koa对象表示web app本身:
const app = new Koa();

//////////创建服务
//添加post处理的中间件
app.use(bodyParser());
// add router middleware:
app.use(router.routes());
//添加session
//const Store = require("./models/Store");
app.use(session({
    key: "SESSIONID",   //default "koa:sess"
    //store: new Store()    //不使用redis
}));

///路由
// add url-route:
router.get('/index', async (ctx, next) => {
    var qidianid = ctx.request.query.qidianid;
    var authorId = ctx.request.query.authorId;
    
});

/*************** 搜索小说 *******************/
router.get('/searchBook', async (ctx, next) => {
    var keys = ctx.request.query.kw;

    let searchBook = await GetBooks.searchBook({
        ops: {name: keys, sourceType: "qidian"},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
        charset: 'utf8'
    });
    
    ctx.body = {
        status: searchBook.status,
        data: searchBook.result
    };
    
});
/*************** 搜索一本书 *******************/
router.get('/searchOneBook', async (ctx, next) => {
    var keys = ctx.request.query.kw;

    let searchBook = await GetBooks.searchBook({
        ops: {name: keys, sourceType: "qidian"},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
        charset: 'utf8'
    });
    
    ctx.body = {
        status: searchBook.status,
        data: searchBook.result
    };
    
});
////////从起点获取详细的小说信息，包含起点小说列表，小说评论
router.get('/getBookInfo', async (ctx, next) => {
    //var keys = escape(ctx.request.body.val);
    var qidianid = ctx.request.query.qidianid;
    var authorId = ctx.request.query.authorId;
    
    let data = {};
    //获取小说详细信息
    let nowBook = await GetBooks.getBookinfo({
        ops: {authorId: authorId, qidianid: qidianid, sourceType: "qidian"},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"}
    });
    //////只要需要两次请求的才需要判断第一个请求 来中断后续请求
    if(nowBook.status != 1){
        ctx.body = {
            status: nowBook.status,
            data: nowBook.result
        }
        return false;
    }
    
    //获取小说其他书籍
    let otherBook = await GetBooks.getOtherBook({
        ops: {authorId: authorId, qidianid: qidianid, sourceType: "qidian"},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"}
    });

    data = nowBook.result;
    data.authorBooks = otherBook.result;

    ctx.body = {
        status: nowBook.status,
        data: data
    }
    
});

///获取小说的文章列表，包含切换起点时，也会重新搜索，
router.get('/getBookList', async (ctx, next) => {
    let qidianid = ctx.request.query.qidianid;
    let name = ctx.request.query.name;
    let author = ctx.request.query.author;
    let sourceType = ctx.request.query.sourceType;

    var search;
    /******** 如果是起点,不需要搜索 ********/
    if(sourceType != "qidian"){
        //先搜索，返回页面的字符集类型
        search = await GetBooks.searchBook({
            ops: {name: name, author: author, sourceType: sourceType},
            headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"}
        });
        if(search.status != 1){
            ctx.body = {
                status: search.status,
                data: search.result
            }
            return false;
        }
    }else{
        search = {
            result: "",
            charset: "utf8"
        }
    };

    ////后获取小说列表
    let list = await GetBooks.getBookList({
        ops: {qidianid: qidianid, link: search.result, sourceType: sourceType},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": 'text/html; charset='+ search.charset},
        charset: search.charset
    });
    ctx.body = {
        status: list.status,
        data: list.result
    }
    
});

////////////获取小说的文章
router.get('/getBookDetails', async (ctx, next) => {
    //var keys = escape(ctx.request.body.val);
    var name = encodeURI(ctx.request.query.name);
    var link = ctx.request.query.link;
    var sourceType = ctx.request.query.sourceType;
    //通过第一步搜搜拿到字符集
    var charset = ctx.request.query.charset;

    console.log(link)
    console.log(charset)

    let detail = await GetBooks.getBookDetail({
        ops: {name: name, link: link, sourceType: sourceType},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
        charset: charset
    });

    ctx.body = {
        status: detail.status,
        data: detail.result
    };
    
});
////////////获取全部的小说的文章，post才能发送数组
router.post('/getBookAllDetails', async (ctx, next) => {
    var name = ctx.request.body.name;
    var sourceType = ctx.request.body.sourceType;
    //通过第一步搜搜拿到字符集
    var charset = ctx.request.body.charset;

    var pageList = ctx.request.body.pageList,
        contentList = ctx.request.body.contentList;
        //字符串转换为数组
        pageList = pageList.split(',');
        //判断是否有内容
        contentList = contentList.split(',');

    let status = 1;
    let result = [];

    for(var i = 0; i<pageList.length;i++){
        //判断是否有内容
        if(contentList[i] == 1){
            result[i] == "";
            continue;
        }

        let detail = await GetBooks.getBookDetail({
            ops: {name: name, link: pageList[i], sourceType: sourceType},
            headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
            charset: charset
        });
        status = detail.status;
        result[i] = detail.result;
    }
    console.log('下载的内容'+ result)
    //返回修改后的数组
    ctx.body = {
        status: status,
        data: result
    };
    
});


////////////获取起点首页强推
router.get('/getHotList', async (ctx, next) => {
    let type = ctx.request.query.type;
    let link = "https://www.qidian.com/";
    if(type == "all"){
        link = "https://www.qidian.com/book/strongrec"
    }

    let detail = await GetBooks.getHotList({
        ops: {link: link, type: type, sourceType: "qidian"},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
        charset: "utf8"
    });

    ctx.body = {
        status: detail.status,
        data: detail.result
    };
    
});
///获取排行榜
router.get('/getRanks', async (ctx, next) => {
    let id = ctx.request.query.id,
        type = ctx.request.query.type,
        name = ctx.request.query.name,
        page = ctx.request.query.page,
        clasfy = ctx.request.query.clasfy;

    let ranks = await GetBooks.getRanksBook({
        ops: {id: id, clasfy: clasfy, type: type, name: name, page: page, sourceType: "qidian"},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
        charset: 'utf8'
    });
    
    ctx.body = {
        status: ranks.status,
        data: ranks.result
    };
    
});
///获取类别分类
router.get('/getClfMenus', async (ctx, next) => {
    let link = ctx.request.query.link;

    let menus = await GetBooks.getMenus({
        ops: {link: link, sourceType: "qidian"},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
        charset: 'utf8'
    });
    
    ctx.body = {
        status: menus.status,
        data: menus.result
    };
    
});
///获取分类书籍列表
router.get('/getClfBookList', async (ctx, next) => {
    let id = ctx.request.query.id,
        link = '',
        chanId = ctx.request.query.chanId,
        subCateId = ctx.request.query.subCateId,
        orderId = ctx.request.query.orderId,
        page = ctx.request.query.page;

    let list = await GetBooks.getClfBookList({
        ops: {id: id, link: link, chanId: chanId, subCateId: subCateId, orderId: orderId, page: page, sourceType: "qidian"},
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
        charset: 'utf8'
    });
    console.log(list);
    
    ctx.body = {
        status: list.status,
        data: list.result
    };
    
});
////////////更新书架
router.post('/updataBookList', async (ctx, next) => {
    let ids = (ctx.request.body.ids).split(','),
        qidianids = (ctx.request.body.qidianids).split(','),
        names = (ctx.request.body.names).split(','),
        listLinks = (ctx.request.body.listLinks).split(','),
        sourceTypes = (ctx.request.body.sourceTypes).split(','),
        charsets = (ctx.request.body.charsets).split(',');

    let status = 1;
    let result = [];

    for(var i = 0; i<ids.length;i++){
        ////后获取小说列表
        let list = GetBooks.getBookList({
            ops: {bid: ids[i], qidianid: qidianids[i], link: decodeURIComponent(listLinks[i]), sourceType: sourceTypes[i]},
            headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": 'text/html; charset='+ charsets[i]},
            charset: charsets[i]
        });
        let searchBook = GetBooks.searchBook({
            ops: {name: names[i], sourceType: "qidian"},
            headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8"},
            charset: 'utf8'
        });
        let results = await Promise.all([list, searchBook]);
        let l_result = results[0],
            s_result = results[1];

        l_result.result.bid = parseInt(ids[i]);
        if(s_result.status==1){
            l_result.result.nowPage = s_result.result[0].nowPage;
            l_result.result.nowTime = s_result.result[0].nowTime;
            l_result.result.pageNumbe = s_result.result[0].pageNumbe;
            console.log(l_result.result.pageList)
            l_result.result.ptotal = l_result.result.pageList.length;
        };
        ////判断两个接口的状态值，搜索失败，则使用100
        l_result.status = l_result.status==1? (s_result.status==1? 1: 100):  l_result.status;
        
        result.push(l_result)
    }
    //返回修改后的数组
    ctx.body = {
        status: status,
        data: result
    };
    
});

////////////注册
router.post('/register', async (ctx, next) => {
    var name = ctx.request.body.name,
        password = ctx.request.body.password,
        repeatPwd = ctx.request.body.repeatPwd,
        phone = ctx.request.body.phone,
        smsCode = ctx.request.body.smsCode;
    //判断密码是否相等，手机验证码是否正确

    var user = new User({
        name: name,
        password: password,
        phone: phone
    });
    console.log(user)
    let p1 = function(){
        return new Promise(function(resolve, reject) {
            /////查询是否已经占用了用户名
            User.findOne({name: name}, function(err, dd){
                if(err){ console.log(err); resolve({status: -404, result: '数据库查询错误'}); }
                if(!!!dd){//未查到
                    user.save(function(err, dd){
                        if(err){ console.log(err); resolve({status: -404, result: '数据库查询错误'}); }
                        resolve({status: 1, result: "注册成功！"});
                    })
                }else{
                    resolve({status: -12, result: "用户名已经被注册了！"});
                }
            })
        })
    }
    let _result = await p1();
    //返回修改后的数组
    ctx.body = {
        status: _result.status,
        data: _result.result
    };
    
});
////////////登陆
router.post('/login', async (ctx, next) => {
    var name = ctx.request.body.name;
    var password = ctx.request.body.password;

    var status = 1,
        result = "";

    let p1 = function(){
        return new Promise(function(resolve, reject) {
            /////查询是否已经占用了用户名
            User.findOne({name: name}, function(err, user){
                if(err){ console.log(err); resolve({status: -404, result: '数据库查询错误'}); }
                if(user){
                    user.comparePassword(password, function(err, isMatch){
                        if(err) console.log(err);
                        let temp;
                        //判断密码是否相等
                        if(isMatch){
                            temp = {status: 1, result: "登陆成功！"};
                            ////////设置session
                            console.log('session' + JSON.stringify(ctx));
                            //ctx.req.session.name = name;
                        }else{
                            temp = {status: -10, result: "密码错误"};
                        }
                        resolve(temp);
                    })
                }else{
                    resolve({status: -11, result: "该用户未注册"});
                }
            })
        })
    }
    let _result = await p1();
    console.log(_result);
    //返回修改后的数组
    //ctx.response.setHeader("Access-Control-Allow-Credentials","true");
    ctx.body = {
        status: _result.status,
        data: _result.result
    };
});
////////////获取登陆状态，获取初始化数据
router.get('/init', async (ctx, next) => {
    //let id = ctx.request.query.id;

    var status = 1,
        result = "";

    let p1 = function(){
        return new Promise(function(resolve, reject) {
            /////查询是否已经占用了用户名
            User.findOne({name: name}, function(err, user){
                if(err){ console.log(err); resolve({status: -404, result: '数据库查询错误'}); }
                if(user){
                    user.comparePassword(password, function(err, isMatch){
                        if(err) console.log(err);
                        let temp;
                        //判断密码是否相等
                        if(isMatch){
                            temp = {status: 1, result: "登陆成功！"};
                            ////////设置session
                            console.log('session' + JSON.stringify(ctx));
                            //ctx.req.session.name = name;
                        }else{
                            temp = {status: -10, result: "密码错误"};
                        }
                        resolve(temp);
                    })
                }else{
                    resolve({status: -11, result: "该用户未注册"});
                }
            })
        })
    }
    let _result = await p1();
    console.log(_result);
    //返回修改后的数组
    //ctx.response.setHeader("Access-Control-Allow-Credentials","true");
    ctx.body = {
        status: _result.status,
        data: _result.result
    };
});

////////////上传
router.post('/updateCase', async (ctx, next) => {
    /*var name = ctx.request.body.name;
    var password = ctx.request.body.password;*/
    var data =ctx.request.body;

    var status = 1,
        result = "";

    let p1 = function(data){
        let _case = new Case({
            bid: data.bid,
            qidianid: data.qidianid,
            btype: data.btype,
            name: data.name,
            link: data.link,
            introduce: data.introduce,
            imgUrl: data.imgUrl,
            author: data.author,
            authorId: data.authorId,
            charset: data.charset,
            sourceType: data.sourceType,
            sourceTypeName: data.sourceTypeName
        });
        return new Promise(function(resolve, reject) {
            /////查询是否已经占用了用户名
            Case.findOne({bid: data.bid}, function(err, dd){
                if(err){ console.log(err); resolve({status: -404, result: '数据库查询错误'}); }
                if(!!!dd){//未查到
                    _case.save(function(err, dd){
                        if(err){ console.log(err); resolve({status: -404, result: '数据库查询错误'}); }
                        resolve({status: 1, result: "添加成功"});
                    })
                }else{
                    //resolve({status: -12, result: "用户名已经被注册了！"});
                    resolve({status: 1, result: "已经存在"});
                }
            })
        })
    }

    let _result = {status: 1, result: '上传成功！'};
    for(let x in data){
        let tmps = await p1(data[x]);
        if(tmps.status != 1) _result.result = '上传失败！';
    }
    
    console.log(_result);
    //返回修改后的数组
    //ctx.response.setHeader("Access-Control-Allow-Credentials","true");
    ctx.body = {
        status: _result.status,
        data: _result.result
    };
});

////////////云端下载
router.get('/dldateCase', async (ctx, next) => {
    let uid = ctx.request.query.uid;

    let p1 = function(){
        return new Promise(function(resolve, reject) {
            //console.log(Case.find());
            /////查询是否已经占用了用户名
            Case.find(function(err, result){
                if(err){ console.log(err); resolve({status: -404, result: '数据库查询错误'}); }
                if(result){
                    console.log('书架'+result);
                    temp = {status: 1, result: result};
                    resolve(temp);
                }else{
                    resolve({status: -11, result: "未查到数据"});
                }
            })
        })
    }
    let _result = await p1();
    console.log(_result);
    //返回修改后的数组
    //ctx.response.setHeader("Access-Control-Allow-Credentials","true");
    ctx.body = {
        status: _result.status,
        data: _result.result
    };
    
});

// 在端口3000监听:
app.listen(3888);

