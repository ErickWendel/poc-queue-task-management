'use strict'

const Queue = require('bee-queue')

const Redis = require('redis')
const client = Redis.createClient(6379, 'localhost')
const publisher = Redis.createClient(6379, 'localhost')
const Sequelize = require('sequelize')
const redisConf = {
  prefix: 'bq',
  stallInterval: 5000,
  redis: {
    host: 'localhost',
    port: 6379,
    db: 1,
    options: {}
  },
  getEvents: true,
  isWorker: true,
  sendEvents: true,
  removeOnSuccess: false,
  catchExceptions: false
}

let index = {
  entities: {},
  registerEntities: (sequelize) => {
    const Product = sequelize.define('Product', {
      secao: { type: Sequelize.STRING },
      grupo: { type: Sequelize.INTEGER },
      subgrupo: { type: Sequelize.INTEGER },
      ref_rms: { type: Sequelize.STRING },
      descricao: { type: Sequelize.STRING },
      ean: { type: Sequelize.STRING },
      altura: { type: Sequelize.INTEGER },
      largura: { type: Sequelize.INTEGER },
      comprimento: { type: Sequelize.INTEGER },
      unidademedida: { type: Sequelize.STRING },
      filler_rms: { type: Sequelize.STRING },
      peso_un: { type: Sequelize.INTEGER },
      est_78: { type: Sequelize.INTEGER },
      saida_media: { type: Sequelize.INTEGER },
      est_web_78: { type: Sequelize.STRING },
      ultima_saida: { type: Sequelize.DATE },
      ultima_entrada: { type: Sequelize.DATE },
      dtentradalinha: { type: Sequelize.DATE },
      dtsaidalinha: { type: Sequelize.DATE },
      precode_78: { type: Sequelize.INTEGER },
      precopor_78: { type: Sequelize.INTEGER },
      precoofexc: { type: Sequelize.STRING },
      precopesde_78: { type: Sequelize.INTEGER },
      precopespor_78: { type: Sequelize.INTEGER },
      precopesofexc: { type: Sequelize.STRING },
      precoporkg_78: { type: Sequelize.STRING }
    }, {
        tableName: 'product',
        timestamps: false,
        paranoid: true,
        freezeTableName: true
      })
    return Product
  },
  createQueue: (name) => new Queue(name),
  saveProducts: (job, Product) => {
    const item = job.data.item;
    const connectionString = job.data.connectionString;
    console.log('Saving Product  ' + item._id);
    console.log(`job: ${job.id} - Saving Product: ${item._id}`);
    const Table = index.entities[connectionString.table];
    return Table.create({
      secao: item.SECAO,
      grupo: item.GRUPO,
      subgrupo: item.SUBGRUPO,
      ref_rms: item.REF_RMS,
      descricao: item.DESCRICAO,
      ean: item.EAN,
      altura: item.ALTURA,
      largura: item.LARGURA,
      comprimento: item.COMPRIMENTO,
      unidademedida: item.UNIDADEMEDIDA,
      filler_rms: item.FILLER_RMS,
      peso_un: item.PESO_UN,
      est_78: item.EST_78,
      saida_media: item.SAIDA_MEDIA,
      est_web_78: item.EST_WEB_78,
      ultima_saida: item.ULTIMA_SAIDA,
      ultima_entrada: item.ULTIMA_ENTRADA,
      dtentradalinha: item.DTENTRADALINHA,
      dtsaidalinha: item.DTSAIDALINHA,
      precode_78: item.PRECODE_78,
      precopor_78: item.PRECOPOR_78,
      precoofexc: item.PRECOOFEXC ? item.PRECOOFEXC : '',
      precopesde_78: item.PRECOPESDE_78 ? item.PRECOPESDE_78 : '',
      precopespor_78: item.PRECOPESPOR_78 ? item.PRECOPESPOR_78 : '',
      precopesofexc: item.PRECOPESOFEXC ? item.PRECOPESOFEXC : '',
      precoporkg_78: item.PRECOPORKG_78 ? item.PRECOPORKG_78 : '',
    })
      .then(function (jane) {
        console.log(`job: ${job.id} - terminated at: ${new Date().toISOString()}`)
        publisher.publish('TASK', JSON.stringify({ 'integration_id ': connectionString.integration_id, 'task_id ': item._id, 'status': 'SUCCESS', 'type': 'action' }))
        return true
      })

  },
  methods: {
    senditens: () => {
      const task = index.createQueue('sendItensTask', redisConf);
      const process = task.process((job, done) => {
        try {
          index.saveProducts(job)
            .then((res) => done(null, res))
            .catch(error => {
              console.log(error)
              done(error, null)
            })
        }
        catch (e) {
          done(e, null)
        }

      })
      //ae
      task.on('error', function (err) {
        console.log('A queue error happened: ' + (err.message || err));
      });

      task.on('job retrying', function (jobId, err) {
        console.log(`job: ${jobId} - failed with error ${(err.message || err)} but is being retried!`);
      });

      return { task, process }
    },
    connectDB: (connectionString) => {

      console.log('Connecting database ');
      const sequelize = new Sequelize(`postgres://${connectionString.user}:${connectionString.password}@${connectionString.host}:5432/${connectionString.database}`, { logging: false });

      // define models
      const Product = index.registerEntities(sequelize)
      index.entities['products'] = Product
      return Product
    },
  },
  start: () => {
    client.subscribe('QUEUE')

    client.on('message', (channel_, message_) => {
      const result = JSON.parse(message_)
      const integrations = result.integrations
      const tasks = result.tasks
      integrations.map(integration => {
        const integrationSteps = integration.application.steps
        const steps = integrationSteps.filter(i => i.type === 'action')
        integration.application.steps = steps

        steps.map(step => {
          const fields = step.connection.fields
          const driverType = fields.filter(i => i.key === 'type')[0]
          let connectionString = {}

          console.log('map', driverType.value)
          if (driverType.value.indexOf('postgreSQL') !== -1) {
            connectionString = fields.filter(i => i.key === 'connection_string')[0]
            index.methods.connectDB(connectionString)
          }
          else return
          const method = step.call.name.toLowerCase()
          connectionString.integration_id = integration._id
          let queue = index.methods[method]() 
          tasks.map(item => {
            queue.task.createJob({ item: item, connectionString })
              .retries(3)
              .save((err, job) => { 
              })
          })
        })

      })
    })
  }
}

index.start()

