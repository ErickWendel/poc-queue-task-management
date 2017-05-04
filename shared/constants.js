'use strict'

const Constants = {
    channels: {
        QUEUE: 'QUEUE',
        TRIGGER: 'TRIGGER',
        ACTION: 'ACTION'
    },
    redis: {
        host: process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost',
        port: process.env.REDIS_PORT_6379_TCP_PORT || '6379'
    }
}

module.exports = Constants