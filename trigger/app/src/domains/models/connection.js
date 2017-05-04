'use strict'

const Mongoose = require('mongoose')
    , Schema = Mongoose.Schema

let ConnectionSchema = new Schema({
    name: {
        type: String
    },
    fields: [{
        key: String,
        value: String
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = {
    Entity: ConnectionSchema,
    Model: Mongoose.model('connection', ConnectionSchema)
}
