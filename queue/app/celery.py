from __future__ import absolute_import, unicode_literals
from celery import Celery, Task 
import time
import redis 
task = Task
app = Celery('app',
             broker='amqp://guest:guest@localhost:5672/',
             backend='redis://127.0.0.1:6379/0',
             include=['app.actions.execution'],
             accept_content=['json','application/text']
             )
 
app.conf.update(
    result_expires=3600,
)


class BaseTasks(Task):
    def __init__(self): 
        self.methods = {'senditens': None   }   
        self.connection_string =  {'user':'', 'password':'', 'host':'', 'database':''}
        self.entities = {'products' : None}
        self.db = None
        
        self.redis_connection = redis.StrictRedis(host='localhost', port=6379, db=0) 
        self.pubsub = self.redis_connection.pubsub()
        self.pubsub.subscribe(['QUEUE'])  
   
    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        if self.max_retries == self.request.retries:
            integration_id = args[1]['integration_id']
            task_id = args[0]['_id']
            item = {'integration_id ': integration_id, 'task_id ': task_id, 'status':'ERROR', 'type': 'action' } 
            self.redis_connection.publish('TASK', item)

            
            print('enviou')
if __name__ == '__main__':   
    app.start() 