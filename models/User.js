var mongoose = require('mongoose')

var userSchemas = require('../schemas/User')
var User = mongoose.model('User', userSchemas)

module.exports = User

//./mongod.exe --config D:\MongoDB\conf\mongodb.config --install --serviceName "MongoDB"
//D:\MongoDB\Server\3.6\bin\mongod.exe --config D:\MongoDB\conf\mongodb.config --install --serviceName "MongoDB"
//.\mongod.exe --install --serviceName "MongoDB"