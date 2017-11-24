var http = require('http')
var Promise = require('bluebird')
var fs = require('fs')
var log = require('./logger')

module.exports.download = function (options, targetFileName) {
    return new Promise(function (resolve, reject) {
        var out = fs.createWriteStream(targetFileName)
        out.on('open', function (fd) {
            log.info('open ', targetFileName)
        })
        var req = http.request(options, function (res) {
            log.info(`STATUS: ${res.statusCode}`)
            log.info(`HEADERS: ${JSON.stringify(res.headers)}`)
            //res.setEncoding('utf8');
            res.on('data', function (chunk) {
                out.write(chunk)
            })
            res.on('end', function () {
                log.info('No more data in response.')
                out.end('end', function () {
                    log.info('Total write:' + out.bytesWritten)
                    resolve()
                })
            })
        })
        req.on('error', function (e) {
            log.info('problem with request:', e)
            reject(e)
        })
        req.end()
    })

}