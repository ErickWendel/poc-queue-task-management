'use strict'

const BodyParser = require('body-parser')
    , Cors = require('cors')
    , Mongodb = require('../database/mongodb')
    , Routes = require('../../routes/index')
    , Bluebird = require('bluebird')
    , Mongoose = require('mongoose')
    , Middlewares = require('../../middlewares/index')
    , Services = require('../../services/index')

let app = {
    ports: {
        http: (process.env.HTTPS_PORT || 8080)
    },
    events: {
        afterStarted: () => {
            console.log(`server started at ${app.ports.http}`)
        }
    },
    middlewares: (app_) => {
        Mongodb.connect()
        app_.use(Cors())
        app_.use(BodyParser.json())
        app_.use(BodyParser.urlencoded({
            extended: true
        }))
        Routes(app_)
        Services.Process.Cron.start()
    },
    up: (app_) => {
        app.middlewares(app_)
        app_.listen(app.ports.http, app.events.afterStarted)
    }
}

module.exports = app