'use strict';
const mongoose = require('mongoose');
const { Store } = require("koa-session2");

const SessionSchema = new mongoose.Schema({
	_id: String,
    data: Object, 
	updatedAt: {
        default: new Date(),
        expires: 86400, // 1 day
        type: Date
    }
})

//生成模型
var SessionModel = mongoose.model('Session', SessionSchema)//生成数据库
 
class MongooseStore extends Store {
    constructor() {
        super();
    }
 
    async get(sid, ctx) {
        let data = await SessionModel.find({_id: sid});
        return JSON.parse(data);
    }
 
    async set(session, { sid =  this.getID(24), maxAge = 1000000 } = {}, ctx) {
        try {
        	//let new SessionModel({
            // Use redis set EX to automatically drop expired sessions
            await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000);
        } catch (e) {}
        return sid;
    }
 
    async destroy(sid, ctx) {
        return await this.redis.del(`SESSION:${sid}`);
    }
}
 
module.exports = MongooseStore;