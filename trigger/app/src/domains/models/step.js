'use strict'

const Mongoose = require('mongoose')
    , Schema = Mongoose.Schema

let Stepchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    type: String,
    order: {
        type: Number
    },
    connection: {
        type: Schema.Types.ObjectId,
        ref: 'connection'
    },
    call: {
        name: {
            type: String
        },
        file: {
            type: String
        }
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})



module.exports = {
    Entity: Stepchema,
    Model: Mongoose.model('step', Stepchema)
}
