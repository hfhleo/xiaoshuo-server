

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
			headers: {},
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
				return `https://book.qidian.com/info/${ops.qidianid}`;
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
				return `https://book.qidian.com/ajax/comment/index?_csrfToken=V48ubGHTlhHhDN2Ax1XPTsK3oNbDAZRcKGESAwZb&bookId=${ops.qidianid}&pageSize=20`;
			},
			domRules: {
				//threadList,threadCnt
			}
		},
		//讨论
		thread: {
			url: (ops)=>{
				return `https://book.qidian.com/ajax/book/GetBookForum?_csrfToken=V48ubGHTlhHhDN2Ax1XPTsK3oNbDAZRcKGESAwZb&authorId=${ops.authorId}&bookId=${ops.qidianid}&chanId=21&pageSize=20`;
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
				return `https://book.qidian.com/ajax/book/category?_csrfToken=V48ubGHTlhHhDN2Ax1XPTsK3oNbDAZRcKGESAwZb&bookId=${ops.qidianid}`;
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
	biquge: {
		name: '笔趣阁',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `http://www.biquge5200.com/modules/article/search.php?searchkey=${ops.name}`;
			},
			encodeURI: true,
			headers: {},
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
			headers: {},
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
	_81xsw: {
		name: '81中文网',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `http://zhannei.baidu.com/cse/search?s=16095493717575840686&click=1&q=${ops.name}`;
			},
			encodeURI: false,
			//gbk全部要转换成encodeURI_GBK
			encodeURI_GBK: true,
			headers: {},
			domRules: {
				link: {
					dom: "#center .result-list .result-item",
					action: 'find(".result-item-title a").attr("href")',
					prefix: ""
				},
				name: {
					dom: "#center .result-list .result-item",
					action: 'find(".result-item-title a").attr("title")',
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
					prefix: "http://www.81xsw.com"
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
			headers: {},
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
	shuquba: {
		name: '书趣吧',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `http://zhannei.baidu.com/cse/search?s=14542303413927578789&entry=1&ie=gbk&q=${ops.name}`;
			},
			encodeURI: false,
			encodeURI_GBK: true,
			headers: {},
			domRules: {
				link: {
					dom: ".result-list .result-item",
					action: 'eq(0).find(".result-game-item-title-link").attr("href")',
					prefix: ""
				},
				charset: {
					value: 'gbk',
					dom: "meta",
					action: 'attr("charset").split("-").join("")'
				}
			}
		},
		list: {
			domRules: {
				//结果列表
				lists: {
					dom: "#main .chapterlist",
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
	_168xs: {
		name: '一流吧',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `http://zhannei.baidu.com/cse/search?s=100040006372621772&ie=gbk&entry=1&q=${ops.name}`;
			},
			encodeURI_GBK: true,
			headers: {},
			domRules: {
				link: {
					dom: "#center .result-list .result-item",
					action: 'find(".result-item-title a").attr("href")',
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
					dom: "#main .chapterlist",
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
	lwtxt: {
		name: '乐文小说网',
		search: {
			method: "GET",
			formData: (ops)=>{
				return ""
			},
			url: (ops)=>{
				return `http://zhannei.baidu.com/cse/search?s=103623352827404213&q=${ops.name}&isNeedCheckDomain=1&jump=1`;
			},
			encodeURI: false,
			//gbk全部要转换成encodeURI_GBK
			encodeURI_GBK: true,
			headers: {},
			domRules: {
				link: {
					dom: "#center .result-list .result-item",
					action: 'find(".result-item-title a").attr("href")',
					prefix: ""
				},
				name: {
					dom: "#center .result-list .result-item",
					action: 'find(".result-item-title a").attr("title")',
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
					dom: "#defaulthtml4 table",
					action: 'find("tr")'
				},
				sublists: "td",
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
					dom: "#content p",
					action: 'text()'
				}
			}
		}
	},
	yunlaige: {
		name: '云来阁',
		search: {
			method: "POST",
			formData: (ops)=>{
				return {searchtype: "articlename",searchkey: ops.name, action:"login", submit: "%26%23160%3B%CB%D1%26%23160%3B%26%23160%3B%CB%F7%26%23160%3B"}
			},
			url: (ops)=>{
				return `http://www.yunlaige.com/modules/article/search.php`;
			},
			encodeURI: false,
			//gbk全部要转换成encodeURI_GBK
			encodeURI_GBK: true,
			headers: {},
			domRules: {
				link: {
					dom: "#content .readnow",
					action: 'attr("href")',
					prefix: ""
				},
				name: {
					dom: "#content .info h2 a",
					action: 'text()',
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
					dom: "#lcontenttable",
					action: 'find("tr")'
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
					dom: "#content",
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
				return `http://www.aszw.org/modules/article/search.php`;
			},
			encodeURI: false,
			encodeURI_GBK: true,
			headers: {},
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
			headers: {Cookie: "UM_distinctid=15f68f26ba223e-0623df1f0a839f-e313761-1fa400-15f68f26ba36e6; bdshare_firstime=1509294240643; jieqiVisitTime=jieqiArticlesearchTime%3D1509460833; CNZZDATA1262002497=1088866520-1509290294-null%7C1509457737; cscpvcouplet_fidx=1; ftcpvrich_fidx=3"},
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
	}
}




module.exports =  rules