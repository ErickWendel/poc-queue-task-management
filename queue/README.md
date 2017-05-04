run with celery on terminal

celery -A app worker --loglevel=info --concurrency=10 --autoscale=10,3