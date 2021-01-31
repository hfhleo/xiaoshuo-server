

//解析配置
const rules = {
	qidian: {
		name: "起点",
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `https://www.qidian.com/search?kw=${ops.name}`;
			},
			encodeURI: true,
			headers: () => {return {}},
			domRules: {
				//结果列表
				lists: ".book-img-text ul>li",
				link: {
					dom: ".book-mid-info h4 a",
					action: 'attr("href")',
					prefix: ""
				},
				//name
				name: {
					dom: ".book-mid-info h4 a",
					action: "text()"
				},
				//id
				id: {
					dom: ".book-mid-info h4 a",
					//动作，是获取属性
					action: 'attr("data-bid")'
				},
				btype: {
					dom: ".author a",
					action: "eq(1).text()"
				},
				//img
				imgUrl: {
					dom: ".book-img-box img",
					action: 'attr("src")'
				},
				//排行
				brank: {
					dom: ".book-img-box .rank-tag",
					action: 'text()'
				},
				//author
				author: {
					dom: ".author .name",
					action: "text()"
				},
				//authorid
				authorId: {
					dom: ".author .name",
					action: 'attr("href").split("author/")[1]'
				},
				//类型
				bookType: {
					dom: ".author a",
					action: "eq(1).text()"
				},
				//书籍状态
				bookState: {
					dom: ".author span",
					action: "text()"
				},
				//简介
				intro: {
					dom: ".intro",
					action: 'text()'
				},
				//最新章节
				nowPage: {
					dom: ".book-mid-info .update a",
					action: 'text().split("最新更新 ").join("")'
				},
				//最新更新的时间，也代表书城的总数字
				nowTime: {
					dom: ".book-mid-info .update span",
					action: "text()"
				},
				//总数字
				pageNumbe: {
					dom: ".book-right-info .total p",
					action: 'eq(0).children("span").text()'
				},
				charset: {
					value: 'utf8'
				}
			}
		},
		info: {
			url: (ops)=>{
				return `https://book.qidian.com/info/${ops.bookID}`;
			},
			domRules: {
				id: {
					dom: "#bookImg",
					action: 'attr("data-bid")'
				},
				//name
				name: {
					dom: ".book-info h1 em",
					action: 'text()'
				},
				imgUrl: {
					dom: "#bookImg img",
					action: 'attr("src")'
				},
				introduce: {
					dom: ".book-content-wrap .book-intro p",
					action: 'text()'
				},
				author: {
					dom: ".book-info h1 .writer",
					action: 'text()'
				},
				authorId: {
					dom: "#authorId",
					action: 'attr("data-authorid")'
				},
				pageNumbe: {
					dom: ".book-info .intro",
					action: 'next().children("em").eq(0).text()'
				},
				nowPage: {
					dom: ".book-state .update .blue",
					action: 'text()'
				},
				nowTime: {
					dom: ".book-state .update .time",
					action: 'text()'
				},
				ptotal: {
					dom: "#J-catalogCount",
					action: 'text().split("(").join("")'
				}
			}
		},
		//评论
		comment: {
			url: (ops)=>{
				return `https://book.qidian.com/ajax/comment/index?_csrfToken=V48ubGHTlhHhDN2Ax1XPTsK3oNbDAZRcKGESAwZb&bookId=${ops.bookID}&pageSize=20`;
			},
			domRules: {
				//threadList,threadCnt
			}
		},
		//讨论
		thread: {
			url: (ops)=>{
				return `https://book.qidian.com/ajax/book/GetBookForum?_csrfToken=V48ubGHTlhHhDN2Ax1XPTsK3oNbDAZRcKGESAwZb&authorId=${ops.authorId}&bookId=${ops.bookID}&chanId=21&pageSize=20`;
			},
			domRules: {
			}
		},
		otherBook: {
			url: (ops)=>{
				return `https://my.qidian.com/author/${ops.authorId}`;
			},
			domRules: {
				//threadList,threadCnt
			}
		},
		//章节列表
		list: {
			url: (ops)=>{
				return `https://book.qidian.com/ajax/book/category?_csrfToken=V48ubGHTlhHhDN2Ax1XPTsK3oNbDAZRcKGESAwZb&bookId=${ops.bookID}`;
			},
			/////起点列表使用接口，所以dom规则不需要
			domRules: {
				//结果列表
				lists: "#j-catalogWrap .volume",
				sublists: ".cf li",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'attr("title")'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "https://read.qidian.com/chapter/"
				},
				isvip: {
					dom: "",
					action: 'children().length>0? true: false'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#j_chapterBox .read-content",
					action: 'text()'
				}
			}
		},
		rankLink: (ops)=>{
			return `https://www.qidian.com/rank/${ops.type}?style=1&chn=${ops.id}&page=${ops.page}`;
		},
		qiantuiLink: (ops)=>{
			return `https://www.qidian.com/${ops.clasfy}`;
		},
		menu: {
			url: (ops)=>{
				return "";
			},
			domRules: {
				lists: {
					dom: ".sub-type-wrap .box-center em",
					action: 'prevAll("a")'
				},
				link: {
					dom: "",
					action: "attr('href')",
					prefix: 'https:'
				},
				text: {
					dom: "",
					action: "text()"
				}
			}
		},
		clfList: {
			url: (ops)=>{
				return `https://www.qidian.com/all?chanId=${ops.chanId}&subCateId=${ops.subCateId}&orderId=${ops.orderId}&page=${ops.page}&style=1&pageSize=20&siteid=1&pubflag=0&hiddenField=0`;
			},
			domRules: {
				lists: {
					dom: ".sub-type-wrap .box-center em",
					action: 'prevAll("a")'
				},
				link: {
					dom: "",
					action: "attr('href')",
					prefix: 'https:'
				},
				text: {
					dom: "",
					action: "text()"
				}
			}
		}
	},
	biquge5200: {
		name: '笔趣阁-5200',
		search: {
			method: "GET",
			formData: (ops) => {
				return ""
			},
			url: (ops) => {
				return `https://www.biquge5200.cc/modules/article/search.php?searchkey=${ops.name}`;
			},
			encodeURI: false,
			headers: () => { return {} },
			domRules: {
				link: {
					dom: ".grid tr",
					action: 'eq(1).children("td").eq(0).find("a").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#list dt",
					action: 'eq(1).nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: ""
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#content",
					action: 'text()'
				}
			}
		}
	},
	smjb: {
		name: '笔趣阁-smjb',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `https://www.smjb.net/so/?searchkey=${ops.name}`;
			},
			encodeURI: true,
			headers: () => {return {}},
			domRules: {
				link: {
					dom: ".cover",
					action: 'eq(0).children(".blue").attr("href")',
					prefix: "https://www.smjb.net"
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#list dt",
					action: 'eq(1).nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "https://www.smjb.net"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#content",
					action: 'text()'
				}
			}
		}
	},
	beqege: {
		name: '笔趣阁-beqege',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `http://www.beqege.cc/search.php?keyword=${ops.name}`;
			},
			encodeURI: true,
			headers: () => {return {}},
			domRules: {
				link: {
					dom: ".chapter-list li",
					action: 'eq(0).children(".s2").find("a").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'utf-8',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#list dl",
					action: 'find("dd")'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "http://www.beqege.cc"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#content",
					action: 'text()'
				}
			}
		}
	},
	wutuxs: {
		name: '无图小说网',
		search: {
			method: "POST",
			formData: (ops) => {
				return {
					searchtype: "articlename",
					searchkey: ops.name,
				}
			},
			url: (ops) => {
				return `http://www.wutuxs.com/modules/article/search.php`;
			},
			encodeURI: true,
			headers: () => { return {} },
			domRules: {
				link: {
					dom: ".grid tr",
					action: 'eq(1).children("td").find("a").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#at",
					action: 'find("td")'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "http://www.wutuxs.com"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#contents",
					action: 'text()'
				}
			}
		}
	},
	luoqiuzw: {
		name: '落秋中文',
		search: {
			method: "GET",
			formData: (ops) => {
				return ""
			},
			url: (ops) => {
				return `https://www.luoqiuzw.com/search?keyword=${ops.name}`;
			},
			encodeURI: false,
			headers: () => { return {} },
			domRules: {
				link: {
					dom: ".novelslist2 li",
					action: 'eq(1).children("span").eq(1).find("a").attr("href")',
					prefix: "https://www.luoqiuzw.com"
				},
				charset: {
					value: 'utf-8',
					// dom: "meta[http-equiv='Content-Type']",
					// action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#list dt",
					action: 'eq(1).nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "https://www.luoqiuzw.com"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#content",
					action: 'text()'
				}
			}
		}
	},
	x222xs: {
		name: '顶点小说',
		search: {
			method: "POST",
			formData: (ops) => {
				return {
					searchkey: ops.name
				}
			},
			url: (ops) => {
				return `https://www.x222xs.com/s.php`;
			},
			encodeURI: false,
			headers: () => { return {} },
			domRules: {
				link: {
					dom: ".grid tr",
					action: 'eq(1).children("td").eq(0).find("a").attr("href")',
					prefix: "https://www.x222xs.com"
				},
				charset: {
					value: 'utf-8',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#list ul",
					action: 'find("li")'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "https://www.x222xs.com"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#content",
					action: 'text()'
				}
			}
		}
	},
	qxiaoshuo: {
		name: '求小说',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `http://www.qiuxiaoshuo.com/search.htm?keyword=${ops.name}`;
			},
			encodeURI: true,
			headers: () => {return {}},
			domRules: {
				link: {
					dom: "#novel-list ul .list-group-item",
					action: 'eq(1).find(".col-xs-3").children("a").attr("href").replace("/book/", "")',
					prefix: "http://www.qiuxiaoshuo.com/read/"
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#chapters-list",
					action: 'find("li").eq(0).nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "http://www.qiuxiaoshuo.com"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#txtContent",
					action: 'text()'
				}
			}
		}
	},
	sqsxs: {
		name: '手牵手小说',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `https://www.sqsxs.com/modules/article/search.php?searchkey=${ops.name}`;
			},
			encodeURI: true,
			//gbk全部要转换成encodeURI_GBK
			encodeURI_GBK: false,
			headers: () => {return {}},
			domRules: {
				link: {
					dom: ".grid tr",
					action: 'eq(1).children("td").eq(0).find("a").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#list dl",
					action: 'find("div").next().nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: ""
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#content",
					action: 'text()'
				}
			}
		}
	},
	snwx: {
		name: '少年文学',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `http://www.snwx8.com/modules/article/search.php?searchkey=${ops.name}`;
			},
			encodeURI: false,
			encodeURI_GBK: true,
			headers: () => {return {}},
			domRules: {
				link: {
					dom: "#newscontent ul li",
					action: 'eq(0).find(".s2").children("a").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#list dl",
					action: 'find("dt").nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "listlink"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#BookText",
					action: 'text()'
				}
			}
		}
	},
	aszw: {
		name: '爱上中文网',
		search: {
			method: "POST",
			formData: (ops)=>{
				return {searchkey: ops.name, searchtype: "articlename"}
			},
			url: (ops)=>{
				return `https://www.aszw6.com/modules/article/search.php`;
			},
			encodeURI: false,
			encodeURI_GBK: true,
			headers: () => {
				const nowTime = parseInt(new Date().getTime() / 1000)
				return {
				"Host": "www.aszw6.com",
				"Connection": "keep-alive",
				//"Content-Length": 57,
				"Cache-Control": "max-age=0",
				"Origin": "https://www.aszw6.com",
				"Upgrade-Insecure-Requests": 1,
				"Content-Type": "application/x-www-form-urlencoded",
				"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
				"Referer": "https://www.aszw6.com/",
				//"Accept-Encoding": "gzip",
				"Accept-Language": "zh-CN,zh;q=0.9",
				"Cookie": `UM_distinctid=17071330d94328-0e8a170e28ca1f-346f780f-13c680-17071330d95472; CNZZDATA1277837554=2033680273-1582447135-%7C1582447135; jieqiVisitTime=jieqiArticlesearchTime%3D${nowTime}`,
				}
			},
			domRules: {
				link: {
					dom: "#content tr",
					action: 'eq(1).find("td").eq(0).children("a").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: ".readerListBody #at tr",
					action: 'eq(0).nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "listlink"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#contents",
					action: 'text()'
				}
			}
		}
	},
	dhzw: {
		name: '大海中文网',
		search: {
			method: "POST",
			formData: (ops)=>{
				return {searchkey: ops.name}
			},
			url: (ops)=>{
				return `http://www.dhzw.org/modules/article/search.php`;
			},
			encodeURI_GBK: true,
			headers: () => {return {Cookie: "UM_distinctid=15f68f26ba223e-0623df1f0a839f-e313761-1fa400-15f68f26ba36e6; bdshare_firstime=1509294240643; jieqiVisitTime=jieqiArticlesearchTime%3D1509460833; CNZZDATA1262002497=1088866520-1509290294-null%7C1509457737; cscpvcouplet_fidx=1; ftcpvrich_fidx=3"}},
			domRules: {
				link: {
					dom: "#newscontent ul li",
					action: 'eq(0).find(".s2").children("a").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#list",
					action: 'find("dd")'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "listlink"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#BookText",
					action: 'text()'
				}
			}
		}
	},
	fkzww: {
		name: '疯狂中文网',
		search: {
			method: "POST",
			formData: (ops)=>{
				//快速搜索
				return {SearchKey: ops.name, SearchClass: 1, button: "%BF%EC%CB%D9%CB%D1%CB%F7", }
			},
			url: (ops)=>{
				return `http://www.fkzww.com/Book/Search.aspx`;
			},
			encodeURI: false,
			encodeURI_GBK: true,
			headers: () => {return {}},
			domRules: {
				link: {
					dom: "#Content #CListTitle",
					action: 'eq(0).find("a").last().attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			url: (ops)=>{
				return `http://www.fkzww.com/Html/Book/8/24599/List.shtml`;
			},
			domRules: {
				//结果列表
				lists: {
					dom: ".readerListBody #at tr",
					action: 'eq(0).nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "listlink"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#contents",
					action: 'text()'
				}
			}
		}
	},
	_7dsw: {
		name: '7度书屋',
		search: {
			method: "POST",
			formData: (ops)=>{
				return {searchkey: ops.name}
			},
			url: (ops)=>{
				return `https://www.7dsw.com/modules/article/search.php`;
			},
			encodeURI: false,
			encodeURI_GBK: true,
			headers: () => {
				return {}
			},
			domRules: {
				link: {
					dom: "#content tr",
					action: 'eq(1).find("td").eq(0).children("a").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta[http-equiv='Content-Type']",
					action: 'attr("content").split("charset=")[1]'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: ".readerListBody #at tr",
					action: 'eq(0).nextAll()'
				},
				sublists: "",
				//name
				name: {
					dom: "a",
					action: "text()"
				},
				info: {
					dom: "a",
					action: 'text()'
				},
				link: {
					dom: "a",
					action: 'attr("href")',
					prefix: "listlink"
				},
				isvip: {
					dom: "a",
					//第三方都是非会员
					action: 'length-1'
				}
			}
		},
		detail: {
			domRules: {
				//结果列表
				content: {
					dom: "#contents",
					action: 'text()'
				}
			}
		}
	},
}




module.exports =  rules