var mongoose = require('mongoose')
//var db = mongoose.createConnection('localhost','movie'); //创建一个数据库连接
var bcrypt = require('bcrypt');

var SALT_WORK_FACTOP = 10;

var UserSchema = new mongoose.Schema({
	name: {
		unique: true,
		type: String
	},
	//name: String,
	phone: String,
	password: String,
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

UserSchema.pre('save',function(){
	var self = this;
	if(this.isNew){//this.isNew如果是新加的，则录入时间和更新时间相等
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else{//如果不是新加，只是修改，则只更新更新时间
		this.meta.updateAt = Date.now();
	}
	var salt = bcrypt.genSaltSync(SALT_WORK_FACTOP);
	var hash = bcrypt.hashSync(self.password, salt);
	self.password = hash;

	next()
})
UserSchema.statics = {//静态方法
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
//实例方法,
UserSchema.methods = {
	//比对密码
	comparePassword: function(_password, cb){
		var isMatch = bcrypt.compareSync(_password, this.password);
		
		cb(null, isMatch);
	}
}

//module.exports = UserSchema;

//生成模型
var UserModel = mongoose.model('User', UserSchema)//生成数据库

//导出模型
module.exports = UserModel;