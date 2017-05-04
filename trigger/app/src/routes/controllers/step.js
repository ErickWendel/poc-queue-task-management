'use strict'

const Domains = require('../../domains/index')
    , Repository = require('../../repositories/index')
    , Middlewares = require('../../middlewares/index')

module.exports = (app_) => {
    app_.route('/v1/step/')
        .get((request_, response_) => {

            return Repository
                .selectFrom(Domains.Step.Model)
                .then((data_) => {
                    if (data_.length > 0) {
                        return response_.status(200).json({
                            result: data_
                        })
                    } else {
                        return response_.status(404).json()
                    }
                })
                .catch((error_) => {
                    return response_.status(500).json({
                        code: 500,
                        message: 'internalServerError',
                        result: error_
                    })
                })

        })
        .post((request_, response_) => {

            let step = new Domains.Step.Model(request_.body)

            return Repository
                .insert(step)
                .then((data_) => {
                    if (data_) {
                        return response_.status(201).json({
                            code: 201,
                            message: 'created',
                            result: data_
                        })
                    }
                })
                .catch((error_) => {
                    return response_.status(500).json({
                        code: 500,
                        message: 'internalServerError',
                        result: error_
                    })
                })
                
        })
}