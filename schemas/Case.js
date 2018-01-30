var mongoose = require('mongoose')
//var db = mongoose.createConnection('localhost','movie'); //创建一个数据库连接


var CaseSchema = new mongoose.Schema({
	bid: String,
	qidianid: String,
	btype: String,
	name: String,
	link: String,
	introduce: String,
	imgUrl: String,
	author: String,
	authorId: String,
	charset: String,
	sourceType: String,
	sourceTypeName: String,
	readTime: String,
	addTime: String,
	//isNew： 
	meta:{
		createAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}

})

CaseSchema.pre('save',function(){
	var self = this;
	if(this.isNew){//this.isNew如果是新加的，则录入时间和更新时间相等
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else{//如果不是新加，只是修改，则只更新更新时间
		this.meta.updateAt = Date.now();
	}

	next()
})
CaseSchema.statics = {//静态方法
	fetch:function(cb){
		return this
			.find({})
			.sort('meta.updateAt')//排序
			.exec(cb)
	},
	findById:function(id,cb){
		return this
			.findOne({_id:id})//只找一个
			.exec(cb)
	}
}

//module.exports = CaseSchema;

//生成模型
var CaseModel = mongoose.model('Case', CaseSchema)//生成数据库

//导出模型
module.exports = CaseModel;