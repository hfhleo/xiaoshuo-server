const cheerio = require("cheerio")
const iconv = require("iconv-lite")
var Buffer = require('buffer').Buffer;
var urlencode = require('urlencode');


/////////规则配置
const Rules = require('./Rules');


//解析起点小说搜索
const anaSearch = async (html, type, oldname)=> {
	let $ = cheerio.load(html, {decodeEntities: false});

	/////////判断解析规则
	var domRules = Rules.qidian.search.domRules;
	for(key in Rules){
        if(type == key){
            domRules = Rules[key].search.domRules;
        };
    }
    //起点默认utf8
    var charset = "utf8";
    var result = [];
    try{
    	//不是起点只需要link
		if(type != "qidian"){
	        var charset = "utf8";
	        if(!!domRules.charset.value){
	            charset = domRules.charset.value;
	        }else{
	            var havCharset = $(domRules.charset.dom).length>0? true: false;
	            charset = havCharset? (eval('$("'+ domRules.charset.dom +'").'+ domRules.charset.action)): "utf8";
	        }

			let link = domRules.link.prefix + eval('$("'+ domRules.link.dom +'").'+ domRules.link.action);
			//let name = eval('$("'+ domRules.name.dom +'").'+ domRules.name.action);
			//if(charset != "utf8") oldname = urldecode(oldname, 'gbk');

			let status = !!link? 1: -2;
			//console.log(name)
			//if(oldname != name) status = -3;
			return {status: status, data: link, charset: charset};
		};
    
    
	    $(domRules.lists).each(function(i, elem) {
	        
	        result.push({
	            qidianid:  parseInt( eval('$(elem).find("'+ domRules.id.dom +'").'+ domRules.id.action) ),
	            btype: eval('$(elem).find("'+ domRules.btype.dom +'").'+ domRules.btype.action),
	            link: eval('$(elem).find("'+ domRules.link.dom +'").'+ domRules.link.action),
	            //拼接完整
	            imgUrl: "https:" + eval('$(elem).find("'+ domRules.imgUrl.dom +'").'+ domRules.imgUrl.action) + ".png",
	            name: eval('$(elem).find("'+ domRules.name.dom +'").'+ domRules.name.action),
	            author: eval('$(elem).find("'+ domRules.author.dom +'").'+ domRules.author.action),
	            authorId: parseInt( eval('$(elem).find("'+ domRules.authorId.dom +'").'+ domRules.authorId.action) ),
	            nowPage: eval('$(elem).find("'+ domRules.nowPage.dom +'").'+ domRules.nowPage.action),
	            readNowPage: '',
	            nowTime: eval('$(elem).find("'+ domRules.nowTime.dom +'").'+ domRules.nowTime.action),
	            //总字数
	            pageNumbe: eval('$(elem).find("'+ domRules.pageNumbe.dom +'").'+ domRules.pageNumbe.action),
	            //默认的来源
	        	sourceType: "qidian",
	        	sourceTypeName: "起点",
	        	//默认的列表数据
	            pageList: [],
	        })
	        
	    });
	    console.log(result)
	}catch(e){
		console.log('搜索抛出异常'+ e);
	}
   	let status = result.length>0? 1: -2;
    return {status: status, data: result, charset: charset};
};

//解析起点小说详细信息
const anaBookinfo = async (html, type)=> {

	let $ = cheerio.load(html, {decodeEntities: false});
	/////////判断解析规则
	var domRules = Rules.qidian.info.domRules;
    //大部分小说站会在详细页面显示文章列表
	var listdomRules = Rules.qidian.list.domRules;

	var data;
	//只有起点的才有在详细页面抓章节
    ///获取章节列表
    let qidianPageList = [],
        cut = 0;

	try{
        let ptotal = parseInt( eval('$("'+ domRules.ptotal.dom +'").'+ domRules.ptotal.action) );
		data = {
			//小说ID
	        qidianid: parseInt( eval('$("'+ domRules.id.dom +'").'+ domRules.id.action) ),
	        //小说名称
	        name: eval('$("'+ domRules.name.dom +'").'+ domRules.name.action),
	        //作品图片
	        imgUrl: "https:"+eval('$("'+ domRules.imgUrl.dom +'").'+ domRules.imgUrl.action)+".png",
	        //作品简介
	        introduce: puer( eval('$("'+ domRules.introduce.dom +'").'+ domRules.introduce.action) ),
	        //作者,
	        author: eval('$("'+ domRules.author.dom +'").'+ domRules.author.action),
	        //作者id
	        authorId: parseInt( eval('$("'+ domRules.authorId.dom +'").'+ domRules.authorId.action) ),
	        //总字数
	        pageNumbe: parseInt( eval('$("'+ domRules.pageNumbe.dom +'").'+ domRules.pageNumbe.action) ),
	        //最新章节
	        nowPage: eval('$("'+ domRules.nowPage.dom +'").'+ domRules.nowPage.action),
	        //最新更新的时间
	        nowTime: eval('$("'+ domRules.nowTime.dom +'").'+ domRules.nowTime.action),
	        //小说阅读总章节数
            ptotal: ptotal,
            //起点的总章数，来判断是否显示更新
	        qidian_ptotal: ptotal,
	        //作品列表
	        pageList: [],
	        //默认的阅读第几章
	        rdPst: 1,
	        isRead: false,
	        isAdd: false,
	        //阅读的时间
	        readTime: new Date().getTime(),
	        //默认的来源
	        sourceType: "qidian",
	        //默认排序
	        sort: "asc",
	        charset: "utf8"
		};

	    $(listdomRules.lists).each(function(i, elem) {
	        var volume = $(elem).find(listdomRules.sublists);
	        volume.each(function(j, ele){
	            cut++;
	            qidianPageList.push({
	                name: eval('$(ele).find("'+ listdomRules.name.dom +'").'+ listdomRules.name.action),
	                pid: cut,
	                info: eval('$(ele).find("'+ listdomRules.info.dom +'").'+ listdomRules.info.action),
	                link: "https:" + eval('$(ele).find("'+ listdomRules.link.dom +'").'+ listdomRules.link.action),
	                isvip: eval('$(ele).find("'+ listdomRules.isvip.dom +'").'+ listdomRules.isvip.action),
	                charset: "utf8",
	                sourceType: "qidian",
	                content: "",
	                ctOffset: {x: 0, y: 0}
	            });
	        });
	    });
	    //data.qidianPageList = qidianPageList;
	    data.pageList = qidianPageList;
	    data.ptotal = data.qidian_ptotal = qidianPageList.length;
	    
	    console.log(qidianPageList)
	}catch (e){
		console.log('详细信息抛出错误'+ e)
	}
	console.log('加入书架后的数据'+JSON.stringify(data))
	let status = !!data.qidianid? 1: -2;
    return {status: status, data: data}
};

//解析起点小说作者的其他书籍
const anaOtherBook = async (html, type)=> {

	$ = cheerio.load(html, {decodeEntities: false});

        var bookList = [];
        $('.author-work .author-item').map(function() {

            bookList.push({
                qidianid: parseInt($(this).find('.author-item-title a').attr('data-bid')),
                workTime: $(this).find('.author-item-time').text(),
                imgUrl: "https:"+$(this).find('.author-item-book img').attr('src')+".png",
                name: $(this).find('.author-item-title a').text(),
                introduce: $(this).find('.author-item-content').text(),
                pageNumbe: $(this).find('.author-item-exp').text(),
                nowPage: $(this).find('.author-item-update a').text(),
                nowTime: $(this).find('.author-item-update span').text()
            })
        })
    let status = bookList.length>0? 1: -2;
    return {status: status, data: bookList}
};

//解析当前小说章节列表
const anaBookList = async (html, type, ops)=> {
	let $ = cheerio.load(html, {decodeEntities: false});
	console.log(html)

	/////////判断解析规则
	var domRules = Rules.qidian.list.domRules,
		name = Rules.qidian.name;
	for(key in Rules){
        if(type == key){
            name = Rules[key].name;
            domRules = Rules[key].list.domRules;
        };
    }
    ////如果是需要列表的前缀
    var linkpf = domRules.link.prefix;
    if(linkpf == "listlink"){
    	//删除最后的index.html
        linkpf = (ops.ops.link).replace("index.html", "");
    };

	///获取章节列表
    let pageList = [],
    	//计数器
        cut = 0;
    try{
    	//起点通过接口json数据
		if(type == "qidian"){
			$ = JSON.parse(html).data.vs;
			for(var i = 0;i<$.length;i++){
				let ele = $[i].cs;
				for(k in ele){
					cut++;
					pageList.push({
			            name: ele[k].cN,
			            pid: cut,
			            info: $[i].vN,
			            link: linkpf + ele[k].cU,
			            isvip: ele[k].sS==1? false: true,
			            time: ele[k].uT,
			            charset: ops.charset,
			            sourceType: type,
			            content: "",
			            ctOffset: {x: 0, y: 0}
			        })
			    }
			};
			let status = pageList.length>0? 1: -2,
				adata = {pageList: pageList, sourceTypeName: name};
			if(status==1){
				let lastp = pageList[pageList.length-1];
				adata.nowPage = lastp.name;
				adata.nowTime = lastp.time;
				adata.readNowPage = lastp.name;
			}

	    	return {status: status, data: adata}
		};

	    var doms = eval('$("'+ domRules.lists.dom +'").'+ domRules.lists.action);
	    //预设两层循环
	    doms.each(function(i, elem) {
	    	if(domRules.sublists == ""){
	    		dodom(elem);
	    	}else{
	    		var volume = $(elem).find(domRules.sublists);
		        volume.each(function(j, ele){
		            dodom(ele);
		        });
	    	}
	    });
	    function dodom(ele){
	    	//判断当前列表是否有内容，去掉无内容的部分
	    	let name = eval('$(ele).find("'+ domRules.name.dom +'").'+ domRules.name.action);
	    	if(!!!name || name=="") return false;
	    	cut++;
	        pageList.push({
	            name: name,
	            pid: cut,
	            info: eval('$(ele).find("'+ domRules.info.dom +'").'+ domRules.info.action),
	            link: linkpf + eval('$(ele).find("'+ domRules.link.dom +'").'+ domRules.link.action),
	            isvip: eval('$(ele).find("'+ domRules.isvip.dom +'").'+ domRules.isvip.action),
	            charset: ops.charset,
	            sourceType: type,
	            content: "",
	            ctOffset: {x: 0, y: 0}
	        });
	    }
	    
	}catch(e){
		console.log('章节列表抛出错误' + e)
	}
	//console.log(pageList);
    let status = pageList.length>0? 1: -2,
		adata = {pageList: pageList, sourceTypeName: name};
	if(status==1) adata.readNowPage = pageList[pageList.length-1].name;
    //包裹pageList  是为了模拟获取详细信息的数据结构
    return {status: status, data: adata}
}


//解析当前小说章节内容
const anaBookDetail = async (html, type)=> {
	let $ = cheerio.load(html, {decodeEntities: false});

	/////////判断解析规则
	var domRules = Rules.qidian.detail.domRules;
	for(key in Rules){
        if(type == key){
            domRules = Rules[key].detail.domRules;
        };
    }
    ///获取章节内容
    let detail = puer( eval('$("'+ domRules.content.dom +'").'+ domRules.content.action) );

    console.log(detail)
    let status = !!detail? 1: -2;
    return {status: status, data: detail}
};


//解析起点小说作者的其他书籍
const anaHotList = async (html, souceType, type)=> {

	$ = cheerio.load(html, {decodeEntities: false});
        var bookList = [];
        if(type=="index"){
	        $('.index-two-wrap .book-list-wrap.mr30 .book-list li').map(function() {
	            bookList.push({
	                qidianid: parseInt($(this).find('.name').attr('data-bid')),
	                btype: $(this).find('.channel').text(),
	                name: $(this).find('.name').text(),
	                author: $(this).find('.author').text(),
	                authorId: parseInt( String($(this).find('.author').attr('href')).split("id=")[1] ),
                    ctOffset: {x: 0, y: 0}
	            })
	        });
	        //删除最后一个
	        bookList.splice(bookList.length-1, 1);
    	}else{
    		$('.strongrec-wrap .strongrec-list').map(function(item) {
    			///插入标题
    			bookList.push({
    				qidianid: parseInt( String($(this).find('.date-range-title .date-from').text()).split(".").join("") ),
    				title: $(this).find('.date-range-title').text()
    			})
    			let eles = $(this).find('.book-list li');
    			eles.map(function(ele) {
    				bookList.push({
		                qidianid: parseInt($(this).find('.name').attr('data-bid')),
		                btype: puer($(this).find('.channel').text()),
		                name: $(this).find('.name').text(),
		                author: $(this).find('.author').text(),
		                authorId: parseInt( String($(this).find('.author').attr('href')).split("id=")[1] ),
		            })
    			})
    		});
    	}
    let status = bookList.length>0? 1: -2;
    return {status: status, data: bookList}
};


/*
替换br和&nbsp标签还有空格
*/
function puer(str) {
    if (!str) {
        return
    }
    str = str.replace(/<br\s*\/?>/gi, "\r\n");
    str = str.replace(/&nbsp;/g, '')
    str = str.replace(/\n/g, '')
    str = str.replace(/\s+/g, '')
    return str
}
////解析排行
const anaRanksBook = async (html, souceType, type)=> {
    let $ = cheerio.load(html, {decodeEntities: false});

    /////////判断解析规则
    var domRules = Rules.qidian.search.domRules;

    //起点默认utf8
    var charset = "utf8";
    var result = [];
    /////跟搜索的规则一样
    try{
        if(type!="qiantui"){
            $(domRules.lists).each(function(i, elem) {
                
                result.push({
                    qidianid:  parseInt( eval('$(elem).find("'+ domRules.id.dom +'").'+ domRules.id.action) ),
                    btype: eval('$(elem).find("'+ domRules.btype.dom +'").'+ domRules.btype.action),
                    link: eval('$(elem).find("'+ domRules.link.dom +'").'+ domRules.link.action),
                    //拼接完整
                    imgUrl: "https:" + eval('$(elem).find("'+ domRules.imgUrl.dom +'").'+ domRules.imgUrl.action) + ".png",
                    brank: eval('$(elem).find("'+ domRules.brank.dom +'").'+ domRules.brank.action),
                    name: eval('$(elem).find("'+ domRules.name.dom +'").'+ domRules.name.action),
                    author: eval('$(elem).find("'+ domRules.author.dom +'").'+ domRules.author.action),
                    authorId: parseInt( eval('$(elem).find("'+ domRules.authorId.dom +'").'+ domRules.authorId.action) ),
                    nowPage: eval('$(elem).find("'+ domRules.nowPage.dom +'").'+ domRules.nowPage.action),
                    nowTime: eval('$(elem).find("'+ domRules.nowTime.dom +'").'+ domRules.nowTime.action),
                    //总字数
                    pageNumbe: eval('$(elem).find("'+ domRules.pageNumbe.dom +'").'+ domRules.pageNumbe.action)

                })
                
            });
        }else{
            $('.week-rec-wrap .rec-list li').map(function() {
                result.push({
                    qidianid: parseInt($(this).find('.name').attr('data-bid')),
                    name: $(this).find('.name').text(),
                    author: $(this).find('.author').text(),
                    authorId: parseInt( String($(this).find('.author').attr('href')).split("id=")[1] ),
                })
            });
            
        }
    }catch(e){
        console.log('排行抛出异常'+ e);
    }
    let status = result.length>0? 1: -2;
    return {status: status, data: result, charset: charset};
};
////解析类别分类
const anaMenus = async (html, souceType, type)=> {
    let $ = cheerio.load(html, {decodeEntities: false});

    /////////判断解析规则
    var domRules = Rules.qidian.menu.domRules;

    //起点默认utf8
    var charset = "utf8";
    var result = [];
    /////跟搜索的规则一样
    let lists = eval('$(domRules.lists.dom).'+ domRules.lists.action);
    try{
        lists.each(function(i, elem) {
        	let link = domRules.link.prefix + eval('$(elem).'+ domRules.link.action),
        		argums = (link.split('?')[1]).split('&'),
        		chanId = 0, subCateId = 0;
        	for(let i = 0;i<argums.length;i++){
        		let nn = argums[i].split('=');
        		if(nn[0]=='chanId') chanId = nn[1];
        		if(nn[0]=='subCateId') subCateId = nn[1];
        	};

            result.push({
            	id: i,
                link: link,
                text: eval('$(elem).'+ domRules.text.action),
                chanId: chanId,
                subCateId: subCateId
            })
        });
    }catch(e){
        console.log('排行抛出异常'+ e);
    }
    let status = result.length>0? 1: -2;
    return {status: status, data: result, charset: charset};
};
////解析分类书籍列表
const anaClfBookList = async (html, souceType)=> {
    let $ = cheerio.load(html, {decodeEntities: false});

    /////////判断解析规则
    var domRules = Rules.qidian.search.domRules;
    //起点默认utf8
    var charset = "utf8";
    var result = [];
    /////跟搜索的规则一样
    try{
        $(domRules.lists).each(function(i, elem) {
            
            result.push({
                qidianid:  parseInt( eval('$(elem).find("'+ domRules.id.dom +'").'+ domRules.id.action) ),
                btype: eval('$(elem).find("'+ domRules.btype.dom +'").'+ domRules.btype.action),
                link: eval('$(elem).find("'+ domRules.link.dom +'").'+ domRules.link.action),
                //拼接完整
                imgUrl: "https:" + eval('$(elem).find("'+ domRules.imgUrl.dom +'").'+ domRules.imgUrl.action) + ".png",
                brank: eval('$(elem).find("'+ domRules.brank.dom +'").'+ domRules.brank.action),
                name: eval('$(elem).find("'+ domRules.name.dom +'").'+ domRules.name.action),
                author: eval('$(elem).find("'+ domRules.author.dom +'").'+ domRules.author.action),
                authorId: parseInt( eval('$(elem).find("'+ domRules.authorId.dom +'").'+ domRules.authorId.action) ),
                //nowPage: eval('$(elem).find("'+ domRules.nowPage.dom +'").'+ domRules.nowPage.action),
                //nowTime: eval('$(elem).find("'+ domRules.nowTime.dom +'").'+ domRules.nowTime.action),
                //总字数
                pageNumbe: eval('$(elem).find("'+ domRules.nowTime.dom +'").'+ domRules.nowTime.action)

            })
            
        });
    }catch(e){
        console.log('排行抛出异常'+ e);
    }
    let status = result.length>0? 1: -2;
    return {status: status, data: result, charset: charset};
};


module.exports =  {
    anaSearch: anaSearch,
    anaBookinfo: anaBookinfo,
    anaOtherBook: anaOtherBook,
    anaBookList: anaBookList,
    anaBookDetail: anaBookDetail,
    anaHotList: anaHotList,
    anaRanksBook: anaRanksBook,
    anaMenus: anaMenus,
    anaClfBookList: anaClfBookList,
}