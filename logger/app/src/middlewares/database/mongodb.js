'use strict'

const Mongoose = require('mongoose')
    , Bluebird = require('bluebird')

Mongoose.Promise = Bluebird

let mongodb = {
    URI: 'mongodb://localhost/apps',
    options: {
        server: {
            auto_reconnect: true,
            poolSize: 10,
            socketOptions: {
                keepAlive: 5,
                connectTimeoutMS: 10000
            }
        }
    },
    connect: () => {
        return Mongoose.connect(mongodb.URI, mongodb.options)
    }
}

module.exports = mongodb