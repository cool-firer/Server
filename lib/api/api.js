var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
var Promise = require('bluebird')
var _ = require('lodash')
var Client = require('ssh2').Client
var log = require('../util/logger')
var dbapi = require('../db/api')
var dbutil = require('../util/dbutil')
var StringUtil = require('../util/StringUtil')

// 获取所有手机
router.get('/devices', function (req, res) {
    dbapi.filterDevices(null, function (device) {
        return {
            product: device('product').default(''),
            serial: device('serial'),
            locateNum: device('locateNum').default(''),
            assertNum: device('assertNum').default(''),
            provider: device('provider'),
            present: device('present').default(false),
            markName: device('markName').default('')
        }
    }).then(function (cursor) {
        return dbutil.toArray(cursor)
    }).then(function (list) {
        res.json({
            success: true,
            devices: list
        })
    }).catch(function (error) {
        res.json({
            success: false,
            result: error
        })
    })

})

// 获取单个手机
router.get('/device/:serial', function (req, res) {
    dbapi.filterDevices({ serial: req.params.serial }, function (device) {
        return {
            product: device('product').default(''),
            serial: device('serial'),
            locateNum: device('locateNum').default(''),
            assertNum: device('assertNum').default(''),
            provider: device('provider'),
            present: device('present').default(false),
            markName: device('markName').default('')
        }
    }).then(function (cursor) {
        return dbutil.toArray(cursor)
    }).then(function (list) {
        res.json({
            success: true,
            device: list.length == 1 ? list[0] : null
        })
    }).catch(function (error) {
        res.json({
            success: false,
            result: error
        })
    })

})

// 根据子服务器ip获取手机状态
router.post('/subserver', function (req, res) {

    var ip = req.body.ip//'172.20.15.13'
    var conn = new Client()
    conn.on('ready', function () {
        log.info('Client :: ready')
        conn.exec('adb devices -l', function (err, stream) {
            if (err) throw err
            stream.on('close', function (code, signal) {
                log.info('Stream :: close :: code: ' + code + ', signal: ' + signal)
                conn.end()
            }).on('data', function (data) {
                log.info('STDOUT: ' + data)
                var devices = StringUtil.parseAdbDevicesList(data.toString())
                log.info('parse adb devices -l:', JSON.stringify(devices, null, 2))
                _.forEach(devices, function (device) {
                    _.assign(device, global.ALL_DEVICES[device.serial])
                })
                res.json({
                    success: true,
                    devices: devices
                })
            }).stderr.on('data', function (data) {
                log.info('STDERR: ' + data)
                res.json({
                    success: false,
                    result: data
                })
            })
        })
    }).on('error', function (err) {
        // 可能连接不上导致超时
        log.info('nnnnnnnnnnnnnnnnnn')
        res.json({
            success: false,
            result: err
        })
    }).connect({
        host: ip,
        port: 22,
        username: 'root',
        password: 'boyaa!@#456',
        readyTimeout: 1000 * 3
    })
})

router.post('/d', function (req, res) {
    log.info(req.body.ttt)
    res.json({
        hah: 'hahahahha'
    })
})

module.exports = router