'use strict'

const Mongoose = require('mongoose')
    , Schema = Mongoose.Schema

let IntegrationSchema = new Schema({
    name: {
        type: String
    },
    company: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'company'
    },
    application: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'application'
    },
    frequency: {
        by_minute: Number
    },
    status: {
        type: String,
        default: 'waiting'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = {
    Entity: IntegrationSchema,
    Model: Mongoose.model('integration', IntegrationSchema)
}
