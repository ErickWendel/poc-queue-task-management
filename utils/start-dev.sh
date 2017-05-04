#! /bin/bash
 
nohup sudo docker-compose up mysql &
nohup sudo docker-compose up mongo &

my_directory=${PWD}
pm2 kill
echo $my_directory
for directory in */app/src ; do
    current_directory="${PWD}/$directory"
    cd $current_directory
    echo "Running: $directory"
    npm i --silent
    pm2 start "$current_directory/index.js" --name $directory
    cd ../../../ 
done

python_directory="$my_directory/queue/app"
pip3 install -r "$python_directory/requirements.txt"
python3 "$python_directory/app.py"
http-server "$my_directory/interface/app"