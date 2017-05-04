'use strict'

const Domains = require('../../domains/index')
    , Repository = require('../../repositories/index')
    , Middlewares = require('../../middlewares/index')
    , MongoJS = require('mongojs')

module.exports = (app_) => {
    app_.route('/v1/integration/')
        .get((request_, response_) => {

            return Repository
                .selectFrom(Domains.Integration.Model)
                .populate('company')
                .populate({
                    path: 'application',
                    model: 'application',
                    populate: {
                        path: 'connection',
                        model: 'connection'
                    }
                })
                .populate({
                    path: 'application',
                    model: 'application',
                    populate: {
                        path: 'steps',
                        model: 'step',
                        populate: {
                            path: 'connection',
                            model: 'connection',
                        }
                    }
                })
                .then((data_) => {

                    let _data = data_.map((item_) => {
                        let triggers = item_.application.steps.filter(x => x.type === 'trigger')
                        let connections = triggers.map(x => x.connection)
                        let fields = connections.map(x => x.fields)

                        return { triggers, connections, fields }
                    })

                    let _fields = _data[0].fields.map((item) => {
                        let keys = item.filter(x => x.key === 'type')
                        let connections = item.filter(x => x.key === 'connection_string')
                        let collections = item.filter(x => x.key === 'collection_name')

                        return { keys, connections, collections }
                    })
                    let results_ = _fields.map(field_ => {
                        let _database = MongoJS(field_.connections.map(x => x.value)[0])

                        let _promise = new Promise((resolve_, reject_) => {
                            _database[field_.collections.map(x => x.value)[0]].find((error_, docs_) => {
                                return (error_ ? reject_(error_) : resolve_(docs_))
                            })
                        })
                        return _promise
                    })
                    return { results_, data_ }

                })
                .then(result => {
                    return Promise.all(result.results_)
                        .then((docs_) => {
                            let results = docs_.reduce((prev, next) => prev.concat(next), [])
                            console.log(' result', results)
                            return response_.status(200).json({
                                code: 200,
                                message: 'ok',
                                result: {
                                    integration: result.data_,
                                    itens: results
                                }
                            })
                        })
                        .catch(error_ => { throw new Error(error_) })
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

            let integration = new Domains.Integration.Model(request_.body)

            return Repository
                .insert(integration)
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