'use strict'

const Service = require('../../services/index')
    , Redis = require('redis')

let redis = {
    _port: (process.env.REDIS_PORT_6379_TCP_PORT || '6379'),
    _host: (process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost'),
    connect: () => {
        return Redis.createClient(redis._port, redis._host)
    }
}

module.exports = redis