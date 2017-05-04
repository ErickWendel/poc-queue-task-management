'use strict'

const Every = require('every-moment')
    , Services = require('../../services/index')
    , Domains = require('../../domains/index')
    , Repository = require('../../repositories/index')
    , MongoJS = require('mongojs')
    , Redis = require('redis')

const host = 'localhost'
const port = 6379
let publisher = Redis.createClient(port, host)

let process = {
    start: () => {
        Every(2, 'second', () => {

            return Repository.selectFrom(Domains.Integration.Model)
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

                    console.log('doing well')

                    return Promise.all(result.results_)
                        .then((docs_) => {

                            publisher.publish('TRACK', JSON.stringify(
                                {
                                    integrations: result.data_,
                                    tasks: docs_.reduce((prev, next) => prev.concat(next), []),
                                    type: 'trigger',
                                    step: 1,
                                }
                            ))
                            const items = JSON.stringify(
                                {
                                    integrations: result.data_,
                                    tasks: docs_.reduce((prev, next) => prev.concat(next), [])
                                }
                            )
                            console.log('items', items.length)
                            publisher.publish('QUEUE', items)

                        })
                        .catch(error_ => {
                            throw new Error(error_)
                        })

                })
                .catch((error_) => {
                    console.log(error_)
                })
        })
    }
}

module.exports = process