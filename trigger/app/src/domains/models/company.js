'use strict'

const Mongoose = require('mongoose')
    , Schema = Mongoose.Schema

let CompanySchema = new Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = {
    Entity: CompanySchema,
    Model: Mongoose.model('company', CompanySchema)
}
