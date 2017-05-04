'use strict'

const Middleware = require('../../middlewares/index')
    , Domains = require('../../domains/index')
    , Mongoose = require('mongoose')
    , MongoJS = require('mongojs')

let track = {
    save: (info_) => {
        if(!info_ || !info_.integrations) return 

        info_.integrations = info_.integrations.map(_ => {
            _.tasks = info_.tasks
            return _
        })

        let track = []

        info_.integrations.forEach(integration => {

            integration.tasks.forEach(task => {

                track.push(new Domains.Track.Model({
                    type: info_.type,
                    step: info_.step,
                    integration_ref: integration._id,
                    task_ref: task._id
                }))

            })
        })

        Mongoose
            .connection
            .open(`mongodb://localhost/apps`)
            .then(() => {
                Domains.Track.Model.create(track)
                    .then(x => {
                        console.log(x)
                    })
            })
            .finally(() => {
                Mongoose.connection.close()
            })
            
    },

    listenTrack: () => {
        global.REDIS_CONN.subscribe('TRACK')
        global.REDIS_CONN.on('message', (channel_, message_) => {
            track.save(JSON.parse(message_))
        })
    },

    listenTask: () => {
        global.REDIS_CONN.subscribe('TASK')
        global.REDIS_CONN.on('message', (channel_, message_) => {
            console.log('TASK', message_)
        })
    }
}

module.exports = track
