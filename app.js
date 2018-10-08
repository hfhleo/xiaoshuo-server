// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
//import session from "koa2-cookie-session";
const session = require("koa-session2");
//const session = require("koa-session");
// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();

////处理类似表单提交时的内容
const bodyParser = require('koa-bodyparser');

const websockify = require('koa-websocket');



const http = require("http")
const zlib = require("zlib");
const fs = require("fs")
const md5 = require("md5")

const mongoose_connect = require('./containers/mongoose_connect');

const User = require('./schemas/User')
const Case = require('./schemas/Case')
const Link = require('./schemas/Link')
//const SessionStore = require('./schemas/SessionStore')

/////////分离出去抓取请求
const GetBooks = require('./containers/GetBooks');
const Settings = require('./settings/Settings');


// 创建一个Koa对象表示web app本身:
const app = new Koa();
const socketApp = websockify(new Koa());

//////////创建服务
//添加post处理的中间件
app.use(bodyParser());
// add router middleware:
app.use(router.routes());
//添加session
//const Store = require("./models/Store");
router.use(session({
    key: "XIAOSHUO_SESSIONID", //default "koa:sess"
    maxAge: 24 * 60 * 60 * 1000, //24小时
    //store: new SessionStore(),
}));

socketApp.ws.use(function(ctx, next) {
  // return `next` to pass the context (ctx) on to the next ws middleware
  return next(ctx);
});

///路由
// add url-route:

////////////获取登陆状态，获取初始化数据
router.get('/init', async(ctx, next) => {
    //let id = ctx.request.query.id;

    var status = 1,
        result = {};
    let cookie_token = ctx.cookies.get("token");
    let cookie_uname = ctx.cookies.get("uname");
    let cookie_uimg = ctx.cookies.get("uimg");
    console.log('客户端的token' + cookie_token);
    console.log('客户端的uname' + cookie_uname);
    console.log('服务器的session' + JSON.stringify(ctx.session))

    /////判断是否登陆
    if (!!ctx.session.token && cookie_token == ctx.session.token) {
        result = { code: 1, settings: Settings, isLogin: 1, name: cookie_uname, img: cookie_uimg, msg: '' }
    } else {
        result = { code: -1, settings: Settings, isLogin: 0, msg: '' }
    }

    //返回修改后的数组
    //ctx.response.setHeader("Access-Control-Allow-Credentials","true");
    ctx.body = {
        status: status,
        data: result
    };
});


/*************** 搜索小说 *******************/
router.get('/searchBook', async(ctx, next) => {
    var keys = ctx.request.query.kw;

    let searchBook = await GetBooks.searchBook({
        ops: { name: keys, sourceType: "qidian" },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
        charset: 'utf8'
    });

    ctx.body = {
        status: searchBook.status,
        data: searchBook.result
    };

});
/*************** 搜索一本书 *******************/
router.get('/searchOneBook', async(ctx, next) => {
    var keys = ctx.request.query.kw;

    let searchBook = await GetBooks.searchBook({
        ops: { name: keys, sourceType: "qidian" },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
        charset: 'utf8'
    });

    ctx.body = {
        status: searchBook.status,
        data: searchBook.result
    };

});
////////从起点获取详细的小说信息，包含起点小说列表，小说评论
router.get('/getBookInfo', async(ctx, next) => {
    //var keys = escape(ctx.request.body.val);
    var bookID = ctx.request.query.bookID;
    var authorId = ctx.request.query.authorId;

    let data = {};
    //获取小说详细信息
    let nowBook = await GetBooks.getBookinfo({
        ops: { authorId: authorId, bookID: bookID, sourceType: "qidian" },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" }
    });
    //////只要需要两次请求的才需要判断第一个请求 来中断后续请求
    if (nowBook.status != 1) {
        ctx.body = {
            status: nowBook.status,
            data: nowBook.result
        }
        return false;
    }

    //获取小说其他书籍
    let otherBook = await GetBooks.getOtherBook({
        ops: { authorId: authorId, bookID: bookID, sourceType: "qidian" },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" }
    });

    data = nowBook.result;
    data.authorBooks = otherBook.result;

    ctx.body = {
        status: nowBook.status,
        data: data
    }

});

///获取小说的文章列表，包含切换起点时，也会重新搜索，
router.get('/getBookList', async(ctx, next) => {
    let bookID = ctx.request.query.bookID;
    let name = ctx.request.query.name;
    let author = ctx.request.query.author;
    let sourceType = ctx.request.query.sourceType;

    var search;
    /******** 如果是起点,不需要搜索 ********/
    if (sourceType != "qidian") {
        //先搜索，返回页面的字符集类型
        search = await GetBooks.searchBook({
            ops: { name: name, author: author, sourceType: sourceType },
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36" }
        });
        if (search.status != 1) {
            ctx.body = {
                status: search.status,
                data: search.result
            }
            return false;
        }
    } else {
        search = {
            result: "",
            charset: "utf8"
        }
    };
    console.log(search)
    ////后获取小说列表
    let list = await GetBooks.getBookList({
        ops: { bookID: bookID, link: search.result, sourceType: sourceType },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": 'text/html; charset=' + search.charset },
        charset: search.charset
    });
    ctx.body = {
        status: list.status,
        data: list.result
    }

});

////////////获取小说的文章
router.get('/getBookDetails', async(ctx, next) => {
    //var keys = escape(ctx.request.body.val);
    var name = encodeURI(ctx.request.query.name);
    var link = ctx.request.query.link;
    var sourceType = ctx.request.query.sourceType;
    //通过第一步搜搜拿到字符集
    var charset = ctx.request.query.charset;

    let detail = await GetBooks.getBookDetail({
        ops: { name: name, link: link, sourceType: sourceType },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
        charset: charset
    });

    ctx.body = {
        status: detail.status,
        data: detail.result
    };

});
////////////获取全部的小说的文章，post才能发送数组
router.post('/getBookAllDetails', async(ctx, next) => {
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

    for (var i = 0; i < pageList.length; i++) {
        //判断是否有内容
        if (contentList[i] == 1) {
            result[i] == "";
            continue;
        }

        let detail = await GetBooks.getBookDetail({
            ops: { name: name, link: pageList[i], sourceType: sourceType },
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
            charset: charset
        });
        status = detail.status;
        result[i] = detail.result;
    }
    //返回修改后的数组
    ctx.body = {
        status: status,
        data: result
    };

});



////////////获取起点首页强推
router.get('/getHotList', async(ctx, next) => {
    let type = ctx.request.query.type;
    let link = "https://www.qidian.com/";
    if (type == "all") {
        link = "https://www.qidian.com/book/strongrec"
    }

    let detail = await GetBooks.getHotList({
        ops: { link: link, type: type, sourceType: "qidian" },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
        charset: "utf8"
    });

    ctx.body = {
        status: detail.status,
        data: detail.result
    };

});
///获取排行榜
router.get('/getRanks', async(ctx, next) => {
    let id = ctx.request.query.id,
        type = ctx.request.query.type,
        name = ctx.request.query.name,
        page = ctx.request.query.page,
        clasfy = ctx.request.query.clasfy;

    let ranks = await GetBooks.getRanksBook({
        ops: { id: id, clasfy: clasfy, type: type, name: name, page: page, sourceType: "qidian" },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
        charset: 'utf8'
    });

    ctx.body = {
        status: ranks.status,
        data: ranks.result
    };

});
///获取类别分类
router.get('/getClfMenus', async(ctx, next) => {
    let link = ctx.request.query.link;

    let menus = await GetBooks.getMenus({
        ops: { link: link, sourceType: "qidian" },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
        charset: 'utf8'
    });

    ctx.body = {
        status: menus.status,
        data: menus.result
    };

});
///获取分类书籍列表
router.get('/getClfBookList', async(ctx, next) => {
    let id = ctx.request.query.id,
        link = '',
        chanId = ctx.request.query.chanId,
        subCateId = ctx.request.query.subCateId,
        orderId = ctx.request.query.orderId,
        page = ctx.request.query.page;

    let list = await GetBooks.getClfBookList({
        ops: { id: id, link: link, chanId: chanId, subCateId: subCateId, orderId: orderId, page: page, sourceType: "qidian" },
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
        charset: 'utf8'
    });

    ctx.body = {
        status: list.status,
        data: list.result
    };

});
////////////更新书架
router.post('/updataBookList', async(ctx, next) => {
    let ids = (ctx.request.body.ids).split(','),
        bookIDs = (ctx.request.body.bookIDs).split(','),
        names = (ctx.request.body.names).split(','),
        listLinks = (ctx.request.body.listLinks).split(','),
        sourceTypes = (ctx.request.body.sourceTypes).split(','),
        charsets = (ctx.request.body.charsets).split(',');

    let status = 1;
    let result = [];

    for (var i = 0; i < ids.length; i++) {
        ////后获取小说列表
        let list = GetBooks.getBookList({
            ops: { bid: ids[i], bookID: bookIDs[i], link: decodeURIComponent(listLinks[i]), sourceType: sourceTypes[i] },
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": 'text/html; charset=' + charsets[i] },
            charset: charsets[i]
        });
        let searchBook = GetBooks.searchBook({
            ops: { name: names[i], sourceType: "qidian" },
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
            charset: 'utf8'
        });
        let results = await Promise.all([list, searchBook]);
        let l_result = results[0],
            s_result = results[1];

        l_result.result.bid = parseInt(ids[i]);
        if (s_result.status == 1) {
            l_result.result.nowPage = s_result.result[0].nowPage;
            l_result.result.nowTime = s_result.result[0].nowTime;
            l_result.result.pageNumbe = s_result.result[0].pageNumbe;
            l_result.result.ptotal = l_result.result.pageList.length;
        };
        ////判断两个接口的状态值，搜索失败，则使用100
        l_result.status = l_result.status == 1 ? (s_result.status == 1 ? 1 : 100) : l_result.status;

        result.push(l_result)
    }
    //返回修改后的数组
    ctx.body = {
        status: status,
        data: result
    };

});

////////////注册
router.post('/register', async(ctx, next) => {
    var name = ctx.request.body.name,
        password = ctx.request.body.password,
        repeatPwd = ctx.request.body.repeatPwd,
        phone = ctx.request.body.phone,
        smsCode = ctx.request.body.smsCode;
    //判断密码是否相等，手机验证码是否正确
    let uid = 'uid' + new Date().getTime();
    var user = new User({
        name: name,
        password: password,
        phone: phone,
        uid: uid
    });
    console.log(user)
    let p1 = function() {
        return new Promise(function(resolve, reject) {
            /////查询是否已经占用了用户名
            User.findOne({ name: name }, function(err, dd) {
                if (err) { console.log(err);
                    resolve({ status: 1, result: { code: -404, msg: "数据库查询错误" } }); }
                if (!!!dd) { //未查到
                    user.save(function(err, dd) {
                        if (err) { console.log(err);
                            resolve({ status: 1, result: { code: -404, msg: "数据库保存错误" } }); }
                        //保存用户和书架关系
                        var _link = new Link({ uid: uid, books: [] });
                        _link.save(function(err, dd) { if (err) { console.log(err); } });

                        resolve({ status: 1, result: { code: 1, msg: "注册成功！" } });
                    })
                } else {
                    resolve({ status: 1, result: { code: -12, msg: "用户名已经被注册了！" } });
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
router.post('/login', async(ctx, next) => {
    var name = ctx.request.body.name;
    var password = ctx.request.body.password;

    var status = 1,
        result = "";

    let p1 = function() {
        return new Promise(function(resolve, reject) {
            /////查询是否已经占用了用户名
            User.findOne({ name: name }, function(err, user) {
                if (err) { console.log(err);
                    resolve({ status: 1, result: { code: -404, msg: "数据库查询错误" } }); }
                if (user) {
                    user.comparePassword(password, function(err, isMatch) {
                        if (err) console.log(err);
                        let temp;
                        //判断密码是否相等
                        if (isMatch) {
                            ////////设置session
                            let token = md5(name + password);
                            //设置session
                            ctx.session.token = token;
                            ctx.session.name = name;
                            //设置cookie
                            ctx.cookies.set("token", token, { path: '/' });
                            ctx.cookies.set("uname", name, { path: '/' });
                            ctx.cookies.set("uimg", '', { path: '/' });
                            temp = { status: 1, result: { code: 1, token: token, uid: user.uid, msg: "登陆成功！" } };
                        } else {
                            temp = { status: 1, result: { code: -10, msg: "密码错误" } };
                        }
                        resolve(temp);
                    })
                } else {
                    resolve({ status: 1, result: { code: -11, msg: "该用户未注册" } });
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
////////////登陆
router.get('/loginOut', async(ctx, next) => {
    //var name = ctx.request.body.name;

    //设置session
    ctx.session.token = null;
    ctx.session.name = null;
    let _result = { status: 1, result: { code: 1, msg: "退出成功！" } };
    //返回修改后的数组
    //ctx.response.setHeader("Access-Control-Allow-Credentials","true");
    ctx.body = {
        status: _result.status,
        data: _result.result
    };
});

////////////上传
router.post('/updateCase', async(ctx, next) => {
    /*var name = ctx.request.body.name;
    var password = ctx.request.body.password;*/
    var data = ctx.request.body.books;
    var uid = ctx.request.body.uid;
    var status = 1;
    var bookInfos = [];
    //添加书籍
    let p1 = function(data) {
        let _case = new Case({
            bid: data.bid,
            bookID: data.bookID,
            btype: data.btype,
            name: data.name,
            link: data.link,
            introduce: data.introduce,
            imgUrl: data.imgUrl,
            author: data.author,
            authorId: data.authorId,
            charset: data.charset,
            sourceType: data.sourceType,
            sourceTypeName: data.sourceTypeName,
            readTime: data.readTime
        });
        return new Promise(function(resolve, reject) {
            /////查询是否已经存在了
            Case.findOne({ bid: data.bid }, function(err, dd1) {
                if (err) { console.log(err);
                    resolve({ code: -404, msg: '数据库查询错误' }); }
                ///不管是不是存在的，都把书籍关联
                bookInfos.push({ bid: data.bid, rdPst: data.rdPst});
                if (!!!dd1) { //未查到
                    _case.save(function(err, dd2) {
                        if (err) { console.log(err);
                            resolve({ code: -404, msg: '数据库查询错误' }); }
                        resolve({ code: 1, msg: "添加成功" });
                    })
                } else {
                    //resolve({code: -12, msg: "用户名已经被注册了！"});
                    resolve({ code: 1, msg: "已经存在" });
                }
            })
        })
    }
    //书架关系
    let p2 = function(uid, bookInfos) {
        return new Promise(function(resolve, reject) {
            Link.findOne({ uid: uid }, function (err, dd) {
                if (dd.uid == uid) return;//已经存在的
                let nowBooks = dd.books.concat(bookInfos);
                /////更新用户书架关系表
                Link.update({ uid: uid }, { books: nowBooks}, function(err, dd2) {
                    if (err) { console.log(err);
                        resolve({ code: -404, msg: '数据库查询错误' }); }
                    resolve({ code: 1, msg: "添加成功" });
                })
            })
        })
    }
    //检查书籍，清空无关联的书籍
    let p3 = function (uid, bookInfos) {
        return new Promise(function (resolve, reject) {
            /////更新用户书架关系表
            Link.find({}, function (err, dd) {
                if (err) {console.log(err);resolve({ code: -404, msg: '数据库查询错误' });}
                let LinkBookids = [],
                    CaseBookids = [];
                dd.map((item)=>{
                    LinkBookids = LinkBookids.concat(item.books.bid || item.books);
                });

                Case.find({}, function (err, dd) {
                    dd.map((item) => {
                        CaseBookids = CaseBookids.concat(item.bid);
                    });
                    if (LinkBookids.length == CaseBookids.length) return;
                    //比对不包含的
                    LinkBookids.map((item1)=>{
                        let idx = -1;
                        for (let i = 0; i < CaseBookids.length;i++){
                            if (item1 == CaseBookids[i]) {
                                idx = i;
                                break;
                            }
                        }
                        //console.log(idx)
                        if (idx != -1) CaseBookids.splice(idx, 1);//删除包含的书籍
                    });
                    //console.log(CaseBookids);
                    //删除多余
                    CaseBookids.map((item)=>{
                        Case.deleteOne({ bid: item.toString() }, function (err, obj){
                            console.log(obj)
                            if (err) throw err;
                            if (obj) console.log("文档删除成功");
                            //mongoose_connect.close();
                        })
                    });
                })
            })
        })
    }

    let _result = { code: 1, msg: '上传成功！' };
    for (let x in data) {
        let tmps = await p1(data[x]);
        if (tmps.code != 1) _result = { code: -1, msg: '上传失败！' };
    }
    //更新关联表
    if (_result.code == 1) {
        _result = await p2(uid, bookInfos);
        
        p3(uid, bookInfos);
    }
    //返回修改后的数组
    //ctx.response.setHeader("Access-Control-Allow-Credentials","true");
    ctx.body = {
        status: status,
        data: _result
    };
});

////////////云端下载
router.get('/dldateCase', async(ctx, next) => {
    let uid = ctx.request.query.uid;
    let p1 = function(uid) {
        return new Promise(function(resolve, reject) {
            Link.findOne({ uid: uid }, function(err, ret) {
                if (err) { console.log(err);
                    resolve({ code: -404, msg: '数据库查询错误' }); }
                if (ret) {
                    temp = { code: 1, books: ret.books };
                    resolve(temp);
                } else {
                    resolve({ code: -11, msg: "未查到数据" });
                }
            })
        })
    }
    let p2 = function(bid) {
        return new Promise(function(resolve, reject) {
            //console.log(Case.find());
            /////查询是否已经占用了用户名
            Case.findOne({ bid: bid }, function(err, result) {
                if (err) { console.log(err);
                    resolve({ code: -404, msg: '数据库查询错误' }); }
                if (result) {
                    temp = { code: 1, book: result };
                    resolve(temp);
                } else {
                    resolve({ code: -11, msg: "未查到数据" });
                }
            })
        })
    };
    //获取当前用户的书架id
    let _books = await p1(uid);
    let _result = { code: 1, arr: [], msg: '同步下载成功！' },
        arr = [];

    //通过id查询书籍
    for (let x = 0; x < _books.books.length; x++) {
        let book = _books.books[x];
        let tmps = await p2(book.uid);
            //tmps.book.rdPst = book.rdPst;
        arr.push(tmps.book);

        if (tmps.code != 1) {
            _result = { code: -1, arr: [], msg: '下载失败！' };
            arr = [];
        }
    }
    _result.arr = arr;

    console.log(2, _result);
    //返回修改后的数组
    //ctx.response.setHeader("Access-Control-Allow-Credentials","true");
    ctx.body = {
        status: 1,
        data: _result
    };

});

socketApp.ws.use(router.all('/updataBookList', (ctx, next) => {
    let len = 0;
    // the websocket is added to the context as `ctx.websocket`.
    ctx.websocket.on('message', async function(message) {
        // print message from the client
        let bookInfo = JSON.parse(message || {});
        console.log(bookInfo);
        ////后获取小说列表
        let list = GetBooks.getBookList({
            ops: { bid: bookInfo.bid, bookID: bookInfo.bookID, link: decodeURIComponent(bookInfo.listLink), sourceType: bookInfo.sourceType },
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": 'text/html; charset=' + bookInfo.charset },
            charset: bookInfo.charset
        });
        let searchBook = GetBooks.searchBook({
            ops: { name: bookInfo.name, sourceType: "qidian" },
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": "text/html; charset=utf8" },
            charset: 'utf8'
        });
        let results = await Promise.all([list, searchBook]);
        let l_result = results[0],
            s_result = results[1];
        l_result.result.bid = parseInt(bookInfo.bid);
        if (s_result.status == 1) {
            l_result.result.nowPage = s_result.result[0].nowPage;
            l_result.result.nowTime = s_result.result[0].nowTime;
            l_result.result.pageNumbe = s_result.result[0].pageNumbe;
            l_result.result.ptotal = l_result.result.pageList.length;
        };
        ////判断两个接口的状态值，搜索失败，则使用100
        l_result.status = l_result.status == 1 ? (s_result.status == 1 ? 1 : 100) : l_result.status;

        let body = {
            status: l_result.status,
            data: l_result
        };

        //返回结果
        ctx.websocket.send(JSON.stringify(body));
        //判断是否结束
        len++;
        if(len == bookInfo.len){
            let body = {
                end: 1
            };
            ctx.websocket.send(JSON.stringify(body));
        }
    });
}).routes());// .routes() is what converts this `router` object to koa2 middleware.

//下载章节
socketApp.ws.use(router.all('/getDownloadBook', (ctx, next) => {
    let len = 0;
    // the websocket is added to the context as `ctx.websocket`.
    ctx.websocket.on('message', async function (message) {
        // print message from the client
        let detailInfo = JSON.parse(message || {});
        console.log(detailInfo);
        ////后获取小说内容
        let detail = await GetBooks.getBookDetail({
            ops: { name: detailInfo.name, link: detailInfo.link, sourceType: detailInfo.sourceType },
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", "Content-Type": 'text/html; charset=' + detailInfo.charset },
            charset: detailInfo.charset
        });

        let body = {
            status: detail.status,
            data: detail.result,
            pos: detailInfo.pos
        };

        //返回结果
        ctx.websocket.send(JSON.stringify(body));
        //判断是否结束
        len++;
        if (len == detailInfo.len) {
            let body = {
                end: 1
            };
            ctx.websocket.send(JSON.stringify(body));
        }
    });
}).routes());// .routes() is what converts this `router` object to koa2 middleware.


// 在端口3000监听:
app.listen(3888);
// socket端口
socketApp.listen(3889);