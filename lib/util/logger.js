var winston = require('winston')
var moment = require('moment')
var path = require('path')
require('winston-daily-rotate-file')


const logger = new (winston.Logger)({
    level: 'info',
    exitOnError: false,
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: function () {
                return moment().format('YYYY-MM-DD:HH:mm:ss.SSS')
            },
            json: false,
            // 设置异常信息易读性
            humanReadableUnhandledException: true,
            // 捕获异常
            handleExceptions: true,
            level: process.env.ENV === 'development' ? 'debug' : 'info'
        }),

        new (winston.transports.DailyRotateFile)({
            timestamp: function () {
                return moment().format('YYYY-MM-DD:HH:mm:ss.SSS')
            },
            filename: path.join(__dirname, '../../log/log'),
            json: false,
            humanReadableUnhandledException: true,
            handleExceptions: true,
            prepend: true,
        })
    ]
});

module.exports = logger