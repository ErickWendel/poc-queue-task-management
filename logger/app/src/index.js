'use strict'

const Middleware = require('./middlewares/index')
    , Service = require('./services/index')

global.REDIS_CONN = Middleware.Redis.connect()

Service.Track.listenTrack()
Service.Track.listenTask()
