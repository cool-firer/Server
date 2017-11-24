var r = require('rethinkdb')
var db = require('./')
var log = require('../util/logger')

var dbapi = Object.create(null)

/*
 * 获取设备 -- devices table
*/
dbapi.filterDevices = function (condition, mapFunction) {
    
    var query = r.db('stf').table('devices')
    if (condition) {
        query = query.filter(condition)
    }
    if (mapFunction) {
        query = query.map(mapFunction)
    }
    return db.run(query)
}

/*
 * 与devices进行eqJoin连接
 * 
 */
dbapi.eqJoin = function (leftSouceSequence, tableName, matchField, mapFunction) {
    var query = r.expr(leftSouceSequence).eqJoin(matchField, r.db('stf').table(tableName))
    if (mapFunction) {
        query = query.map(mapFunction)
    }
    return db.run(query)
}

dbapi.close = function() {
    return db.close()
}
module.exports = dbapi