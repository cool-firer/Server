var Promise = require('bluebird')

var dbutil = Object.create(null)


dbutil.toArray = function (cursor) {
    return new Promise(function (resolve, reject) {
        var result = []
        cursor.eachAsync(function (row) {
            result.push(row)
        }).then(function() {
            resolve(result)
        }).catch(function(error) {
            reject(error)
        })
    })

}


module.exports = dbutil