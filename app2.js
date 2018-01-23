///////请求内容，
function reptile(reqOps, ctx){
    http.get( reqOps, function(res){
        console.log(res);
        var chunks = []
        res.on('data', function(chunk) {
            chunks.push(chunk)
        })
        res.on('end', function() {
            var html = iconv.decode(Buffer.concat(chunks), 'utf8') //转码操作
            var $ = cheerio.load(html, {
                decodeEntities: false
            })
            var lists = []
            $('.main-html').each(function(i, elem) {
                var list = new Object()
                list.tname = $(elem).find('div').eq(0).children().eq(0).text();
                list.link = $(elem).find('div').eq(0).children().eq(0).attr('href');
                list.chapter = $(elem).find('div').eq(1).children().text();
                list.time = $(elem).find('div').eq(2).text();

                lists.push(list)
            })
            /*fs.writeFile("list.json", JSON.stringify(html), function(err) {
                if (!err) {
                    console.log("写文件成功")
                }
            })*/

            ctx.response.body = JSON.stringify(lists);
          //callback.call(this, lists, ctx);

        }).on('error', function() {
            console.log("网页访问出错")
        })
    })
}


router.get('/getBookInfo', async (ctx, next) => {
    //var keys = escape(ctx.request.body.val);
    var bid = ctx.request.query.bid;
    var authorId = ctx.request.query.authorId;
    
    let data = {};
    //获取小说详细信息
    let nowBook = await BookInfo.getBookinfo({
        url: encodeURI(`https://book.qidian.com/info/${bid}`),
        userAgent: "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    });
    
    //获取小说其他书籍
    let otherBook = await BookInfo.getOtherBook({
        url: encodeURI(`https://my.qidian.com/author/${authorId}`),
        userAgent: "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    });
    //bookInfo,commentCon,pageList
    data = nowBook.result;
    data.authorBooks = otherBook.result;
    ctx.body = {
        status: 1,
        data: data
    }
    
});

parseUrl: function (url, callback) {
    async.waterfall([
            function (callback) {   // 动态获取网站编码
                superagent.get(url).end(function (err, res) {
                    var charset = "utf-8";
                    var arr = res.text.match(/<meta([^>]*?)>/g);
                    if (arr) {
                        arr.forEach(function (val) {
                            var match = val.match(/charset\s*=\s*(.+)\"/);
                            if (match && match[1]) {
                                if (match[1].substr(0, 1) == '"')match[1] = match[1].substr(1);
                                charset = match[1].trim();
                            }
                        })
                    }
                    callback(err, charset)
                })
            }, function (charset, callback) {   // 内容爬取
                superagent
                    .get(url)
                    .charset(charset)
                    .end(function (err, res) {
                        if (err) {
                            console.log(err);
                            callback(err);
                            return;
                        }
                        var model = {};
                        var $ = cheerio.load(res.text);
                        var title = _.trim($('title').text());
                        if (title.indexOf('-') > 0) {
                            var strs = _.split(title, '-');
                            model.title = _.trim(title.substr(0, title.lastIndexOf('-')));
                            model.source = _.trim(_.last(strs));
                        } else {
                            model.title = _.trim(title);
                        }
                        callback(err, model);
                    })
            }
        ],
        function (err, model) {
            callback(err, model);
        });
}

router.post('/cssase', async (ctx, next) => {
    var key = ctx.params.key;

    var name = ctx.request.body.name || '',
        password = ctx.request.body.password || '';
    console.log(`signin with name: ${name}, password: ${password}`);
    if (name === 'koa' && password === '12345') {
        ctx.response.body = `<h1>Welcome, ${name}!</h1>`;
    } else {
        ctx.response.body = `<h1>Login failed!</h1>
        <p><a href="/">Try again</a></p>`;
    }
});


//删除非正文内容来提取正文
function toTxT(html) {
  html = html
    .replace(/<br ?\/?>/g, '\n')
    .replace(/ ?/g, ' ')
    .replace(/<!--.*-->/g, '') // 注释

  var $ = cheerio.load(html, { decodeEntities: false })
  var $body = $('html')
  $body.find('meta,div,style,link,script,table,h1,center,title').remove()
  var res = $body.html()
  res = res.replace(/<\/?head>/g, '')
    .replace(/^(\n|\r)+/mg, '')// 删除开头的空行
    .replace(/(\n|\r)+/mg, '\n\n')// 多个换行替换成1个
    .replace(/ {4,}/mg, '  ')// 4个以上的空格统一换成2个
  return res
}