var genericPool = require('generic-pool');
var Promise = require('bluebird')
var log = require('../util/logger')

module.exports = function (r, options) {

    const factory = {
        create: function () {

            return new Promise(function (resolve, reject) {
                r.connect(options, function (err, conn) {
                    log.info("Connection created")
                    if (err) {
                        reject(err)
                    }
                    conn.on('close', function closeListener() {
                        log.info('Connection closed')
                        conn.removeListener('close', closeListener)
                    })
                    resolve(conn)
                })
            })
        },
        destroy: function (client) {
            return new Promise(function (resolve) {
                log.info('i am cloing client')
                client.close().then(function() {
                    resolve()
                })
                
            })
        }
    }
    var opts = {
        max: 10, // maximum size of the pool
        min: 3, // minimum size of the pool
        //evictionRunIntervalMillis: 10* 1000,
        idleTimeoutMillis: 5 * 1000
    }
    var pool = genericPool.createPool(factory, opts)

    function acquire() {
        return new Promise(function (resolve, reject) {
            resolve(pool.acquire())
        }).disposer(function (conn) {
            pool.release(conn)
        })
    }

    pool.run = function (query, opt, done) {
        if (typeof opt === 'function') {
            done = opt
            opt = null
        }
        var p = Promise.using(acquire(), function (conn) {
            return query.run(conn, opt)
        })
        if (done) {
            p.then(function (d) {
                done(null, d)
            }).catch(done)
        } else {
            return p
        }
    }
    pool.close = function () {
        return pool.drain().then(function () {
            return pool.clear();
        });
    }
    return pool
}
