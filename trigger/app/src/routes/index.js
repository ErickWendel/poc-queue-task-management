'use strict'

const CompanyController = require('./controllers/company')
    , IntegrationController = require('./controllers/integration')
    , ApplicationController = require('./controllers/application')
    , ConnectionController = require('./controllers/connection')
    , StepController = require('./controllers/step')

module.exports = (app_) => {
    CompanyController(app_)
    IntegrationController(app_)
    ApplicationController(app_)
    ConnectionController(app_)
    StepController(app_)
}