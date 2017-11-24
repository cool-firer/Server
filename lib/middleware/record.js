var log = require('../util/logger')

module.exports.beforeRequest = function (req, res, next) {
    log.info('---->', req.ip, req.method, req.originalUrl, JSON.stringify(req.body, null ,2))
    next()
}

module.exports.afterRquest = function (req, res, next) {
    var oldJson = res.json

    // 这里只处理只有一个参数的情况，实际上res.json有两个参数：(statusCode, jsonObject)
    res.json = function(obj) {
        log.info('<-----', req.ip, req.method, req.originalUrl, res.statusCode, JSON.stringify(obj, null ,2))
        oldJson.apply(res, arguments)
    }
    //这样也可以，但无法打印出返回数据
    /*res.on('finish', function () {
        log.info('<-----', req.ip, req.method, req.originalUrl, res.statusCode, res.body)
    })*/
    
    next()
}