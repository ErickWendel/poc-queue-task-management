'use strict'

const Mongoose = require('mongoose')
    , Schema = Mongoose.Schema

let ApplicationSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    steps: [{
        type: Schema.Types.ObjectId,
        ref: 'step'
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = {
    Entity: ApplicationSchema,
    Model: Mongoose.model('application', ApplicationSchema)
}
