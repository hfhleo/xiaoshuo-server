//var webpage = require('webpage');
//非全局的phantomjs-node
const phantom = require('phantom');

const getBookinfo = async (ops)=> {
    console.log(Date.now())
    let data = {};
    //创建实例
    let instance = await phantom.create();
    //创建页面容器
    let page = await instance.createPage();
        //设置
    page.setting("userAgent", ops.userAgent)
        //判断是否访问成功
    let status = await page.open(ops.url),
        code = 1;
    if (status !== 'success') {
        //访问失败修改状态码
        code = -1;
    } else {
        //获取当前时间
        var start = Date.now();
        
        var result = await page.evaluate(function() {
            var _id = parseInt($('#bookImg').attr('data-bid'));
            ///获取最新的讨论
            var commentCon = [];
            $('.discuss-list li.cf').each(function(i, elem) {
                var bb = $(elem).find('.discuss-info');
                commentCon.push({
                    id: i+1,
                    ico: "https:"+$(elem).find('.user-photo img').attr('src')+".png",
                    name: bb.find('.blue').text(),
                    //xin: (bb.find('.score-min').attr('class')).split('star')[1],
                    extend: bb.find('h5 a').text().split("\n").join(""),
                    time: bb.find('.info ').children('span').text()
                })
                
            });
            ///获取章节列表
            var pageList = [],
                cut = 0;
            $('#j-catalogWrap .volume').each(function(i, elem) {
                var volume = $(elem).find('.cf li');
                volume.each(function(j, ele){
                    var ta = $(ele).children("a");
                    cut++;
                    pageList.push({
                        //小说ID
                        bid: _id,
                        name: ta.text(),
                        pid: cut,
                        info: ta.attr('title'),
                        link: ta.attr('href'),
                        content: "",
                        isvip: (ta.children().length>0? true: false)
                    });
                });
            });
            return ({
                //bookInfo: {
                    //小说ID
                    id: _id,
                    //小说名称
                    name: $('.book-info h1 em').text(),
                    //作品图片
                    imgUrl: "https:"+$('#bookImg img').attr('src')+".png",
                    //作品简介
                    introduce: $('.book-content-wrap .book-intro p').text().split("\n").join(""),
                    //作者,
                    author: $('.book-info h1 .writer').text(),
                    //作者id
                    authorId: parseInt($('#authorId').attr('data-authorid')),
                    //总字数
                    pageNumbe: $('.book-info .intro').next().children('em').eq(0).text(),
                    //最新章节
                    nowPage: $('.book-state .update .blue').text(),
                    //最新更新的时间
                    nowTime: $('.book-state .update .time').text(),
                    //评论数
                    comment: parseInt($('#J-discusCount').text().split("(").join("")),
                    //小说阅读总章节数
                    ptotal: parseInt($('#J-catalogCount').text().split("(").join("")),
                //},
                /////前15条评论内容
                commentCon: commentCon,
                //作品列表
                pageList: pageList
            })
        })
        data = {
            status: code,
            url: ops.url,
            time: Date.now() - start,
            result: result
        }
    }
    //退出实例
    await instance.exit();

    return data;
};

//作者其它书籍
const getOtherBook = async (ops)=> {
    console.log(Date.now())
    let data = {};
    //创建实例
    let instance = await phantom.create();
    //创建页面容器
    let page = await instance.createPage();
        //设置
    page.setting("userAgent", ops.userAgent)
        //判断是否访问成功
    let status = await page.open(ops.url),
        code = 1;
    if (status !== 'success') {
        //访问失败修改状态码
        code = -1;
    } else {
        //获取当前时间
        var start = Date.now();
        var result = await page.evaluate(function() {
            var bookList = [];
            $('.author-work .author-item').map(function() {

                bookList.push({
                    id: parseInt($(this).find('.author-item-title a').attr('data-bid')),
                    workTime: $(this).find('.author-item-time').text(),
                    imgUrl: "https:"+$(this).find('.author-item-book img').attr('src')+".png",
                    name: $(this).find('.author-item-title a').text(),
                    introduce: $(this).find('.author-item-content').text(),
                    pageNumbe: $(this).find('.author-item-exp').text(),
                    nowPage: $(this).find('.author-item-update a').text(),
                    nowTime: $(this).find('.author-item-update span').text()
                })
            })
            return bookList;
        })
        data = {
            status: code,
            url: ops.url,
            time: Date.now() - start,
            result: result
        }
    }
    //退出实例
    await instance.exit();

    return data;
};


module.exports =  {
    getBookinfo: getBookinfo,
    getOtherBook: getOtherBook
}