var express = require('express')
var xlsx = require("node-xlsx")
var bodyParser = require('body-parser')
var fs = require('fs')
var http = require('http')
var api = require('./lib/api/api')
var log = require('./lib/util/logger')
var dbapi = require('./lib/db/api')
var httputil = require('./lib/util/httputil')
var recordMiddleWare = require('./lib/middleware/record')


function init() {
    // http://test.oa.com:8080/wiki/images/a/ac/Devices.xls
    const options = {
        hostname: 'test.oa.com',
        port: 8080,
        path: '/wiki/images/a/ac/Devices.xls'
    }
    httputil.download(options, 'Devices.xls').then(function () {
        var list = xlsx.parse('Devices.xls')

        var start = 2
        var count = 0
        var devices = {}
        for (; start < list[1].data.length; start++) {
            var line = list[1].data[start]
            var memo = line[line.length - 1]
            count++
            var serial = line[9].replace(/(^\s*)|(\s*$)/g, "")
            devices[serial] = {
                serial: line[9].replace(/(^\s*)|(\s*$)/g, ""),
                assertNum: line[0].replace(/(^\s*)|(\s*$)/g, ""),
                markName: line[1].replace(/(^\s*)|(\s*$)/g, ""),
                version: line[3],
                width: line[4].split('x')[0],
                height: line[4].split('x')[1],
                brand: line[7].toString().replace(/(^\s*)|(\s*$)/g, ""),
                //model: line[8].replace(/(^\s*)|(\s*$)/g, ""),
                locateNum: line[10] ? line[10].replace(/(^\s*)|(\s*$)/g, "") : ''
            }
        }
        global.ALL_DEVICES = devices
        global.ALL_DEVICES_COUNT = count
    })
}


if (require.main === module) {

    init()

    var app = express()
    var server = http.createServer(app)

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(recordMiddleWare.beforeRequest)
    app.use(recordMiddleWare.afterRquest)
    app.use('/api', api)

    server.listen(9090)
    log.info('listening on 9090...')

    process.once('SIGINT', function () {
        log.info('Received SIGINT - shutting down')
        global.ALL_DEVICES = null
        server.close()
        dbapi.close().then(function () {
            log.info('db closed')
            process.exit(0)
        })
    })
    process.once('SIGTERM', function () {
        log.info('Received SIGTERM - shutting down')
        global.ALL_DEVICES = null
        server.close()
        dbapi.close().then(function () {
            log.info('db closed')
            process.exit(0)
        })
    })
}