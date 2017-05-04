from __future__ import absolute_import, unicode_literals
import json 
import time  
from ..celery import app, BaseTasks 
from pony.orm import * 
from datetime import datetime, timedelta 
from celery.utils.log import get_task_logger
from ..entities.Product import define_entities
logger = get_task_logger(__name__) 
 
 
    

@app.task(base=BaseTasks, bind=True)
def connect_postgres(self, connection_string):
   
    user   = connection_string['user']
    password   = connection_string['password'] 
    host  =  connection_string['host'] 
    database  =  connection_string['database']

    if self.connection_string['host'] == host and self.connection_string['database'] == database:
        self.entities['products'] = self.db.Product
        return self.entities 


    self.db = Database()   
    define_entities(self.db)
    self.db.bind('postgres', user=user, password=password, host=host, database=database)
    self.db.generate_mapping(create_tables=True) 
    self.entities['products'] = self.db.Product

    self.connection_string['user'] = user 
    self.connection_string['password'] = password 
    self.connection_string['host'] = host 
    self.connection_string['database'] = database   
     
    return self.entities
 

@app.task(base=BaseTasks, bind=True)
def salve_product(self, item, table):
   with db_session: 
       table(
            SECAO = item['SECAO'] ,
            GRUPO = item['GRUPO'],
            SUBGRUPO = item['SUBGRUPO'],
            REF_RMS = item['REF_RMS'],
            DESCRICAO = item['DESCRICAO'],
            EAN = str(item['EAN']),
            ALTURA = item['ALTURA'],
            LARGURA = item['LARGURA'],
            COMPRIMENTO = item['COMPRIMENTO'],
            UNIDADEMEDIDA = item['UNIDADEMEDIDA'],
            FILLER_RMS = item['FILLER_RMS'],
            PESO_UN = item['PESO_UN'],
            EST_78 = item['EST_78'],
            SAIDA_MEDIA = item['SAIDA_MEDIA'],
            EST_WEB_78 = item['EST_WEB_78'],
            ULTIMA_SAIDA = None if item['ULTIMA_SAIDA'] is None else datetime.strptime(item['ULTIMA_SAIDA'], '%Y-%m-%d %H:%M:%S'),
            ULTIMA_ENTRADA = None if item['ULTIMA_ENTRADA'] is None else datetime.strptime(item['ULTIMA_ENTRADA'], '%Y-%m-%d %H:%M:%S'),
            DTENTRADALINHA = None if item['DTENTRADALINHA'] is None else datetime.strptime(item['DTENTRADALINHA'], '%Y-%m-%d %H:%M:%S'),
            DTSAIDALINHA = None if item['DTSAIDALINHA'] is None else datetime.strptime(item['DTSAIDALINHA'], '%Y-%m-%d %H:%M:%S'),
            PRECODE_78 = item['PRECODE_78'],
            PRECOPOR_78 = item['PRECOPOR_78'],
            PRECOOFEXC = '' if item['PRECOOFEXC'] is None else item['PRECOOFEXC'],
            PRECOPESDE_78 = item['PRECOPESDE_78'],
            PRECOPESPOR_78 = item['PRECOPESPOR_78'],
            PRECOPESOFEXC = '' if item['PRECOPESOFEXC'] is None else item['PRECOPESOFEXC'] ,
            PRECOPORKG_78 ='' if  item['PRECOPORKG_78'] is None else item['PRECOPORKG_78'] ,
            )  

@app.task(base=BaseTasks, bind=True)
def send_items(self, item, connection_string): 
    try: 
        connection = connect_postgres(connection_string)
        
        # print('request.id : %s' % self.request.id)  
        table = connection[connection_string['table']]
        salve_product(item, table)
        log_item = {'integration_id ': connection_string['integration_id'], 'task_id ': item['_id'], 'status':'SUCCESS', 'type': 'action' }

        self.redis_connection.publish('TASK', json.dumps(log_item)) 
    except Exception as ex:
        print('Error, retrying - Error: %s' % ex)
        dt = datetime.now() + timedelta(seconds=1)
        self.retry(countdown=1, eta=dt, ex=ex)  

    return ('inserted item, id = %s, description: %s' % (item['_id'], item['DESCRICAO']))

@app.task(base=BaseTasks, bind=True, default_retry_delay=1,autoretry_for=(Exception,))
def work(self, data): 
    methods = {'senditens': send_items}

    result =  dict(data) 
    integrations = result['integrations']
    itens = list(result['tasks']) 
    # with open('data.json', 'w') as outfile:
    #     json.dump(data, outfile)

    for integration in integrations:
        integration_steps = integration['application']['steps']
        steps = [step for step in integration_steps if step['type'] == 'action']
        integration['application']['steps'] = steps
        for step in steps: 
            fields = step['connection']['fields']   
            driver_type = [field for field  in fields if field['key'] == 'type'][0]
            connection_string = {}
            if 'postgreSQL' ==  driver_type['value']:
                connection_string = [field for field  in fields if field['key'] == 'connection_string'][0]
            else: continue
            #call
            method = str(step['call']['name']) .lower()  
            connection_string['integration_id'] = integration['_id'] 
            for item in itens: methods[method].delay(item, connection_string)
 
             
        

@app.task(base=BaseTasks, bind=True, default_retry_delay=1,autoretry_for=(Exception,))
def init_processing (self):
    
    for item in self.pubsub.listen():
        data = item['data']
        if data  == "KILL":
            self.pubsub.unsubscribe()
            print ("unsubscribed and finished")
            break
        else:    
            print('event received')
            condition = 1 != item['data'] 
            print('condition', condition)
            if condition: 
                
                data = json.loads(item['data'].decode("utf-8"))
                work.delay(data)
                # break 
        time.sleep(0.001)