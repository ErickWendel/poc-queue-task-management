'use strict'

const Mongoose = require('mongoose')
    , Schema = Mongoose.Schema

// Log Tracking:
// A -> Caso Query: Host, DB, Table, Columns, Error Type, Dt, IdIntegration, IdTask, Step (Celery or Node)
// B -> Caso REST: EndPoint, Received Data, Error Type, Dt, IdIntegration, IdTask, Step (Celery or Node)
// C -> Caso  SOAP:EndPoint, Received Data, Error Type, Dt, IdIntegration, IdTask, Step (Celery or Node)

let TrackSchema = new Schema({
    type: {
        type: String
    },
    step: {
        type: Number
    },
    integration_ref: {
        type: Schema.Types.ObjectId,
        ref: 'integration'
    },
    task_ref: {
        type: Schema.Types.ObjectId,
        ref: 'task'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = {
    Entity: TrackSchema,
    Model: Mongoose.model('track', TrackSchema)
}
