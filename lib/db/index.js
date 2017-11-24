var r = require('rethinkdb')
var Pool = require('./pool.js')

var db = module.exports = Object.create(null)

db.pool = Pool(r, {
    host: 'localhost',
    port: 28015,
    db: 'stf'
})

db.run = function (query) {
    return db.pool.run(query)
}

db.close = function () {
    return db.pool.close()
}
