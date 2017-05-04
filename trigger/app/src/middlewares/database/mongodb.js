'use strict'

const Mongoose = require('mongoose')
    , Bluebird = require('bluebird')

Mongoose.Promise = Bluebird

let mongodb = {
    URI: 'mongodb://localhost/apps',
    options: {
        server: {
            ssl: false,
            auto_reconnect: true,
            poolSize: 5,
            socketOptions: {
                keepAlive: 2,
                connectTimeoutMS: 10000
            }
        }
    },
    connect: () => {
        Mongoose.connect(mongodb.URI, mongodb.options)
        Mongoose.connection.on('open', () => {
            console.log('connected at', mongodb.URI)
        })
    }
}

module.exports = mongodb