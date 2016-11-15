#!/bin/sh
GIT_WORK_TREE=/Users/WeiFu/Github/Class/DevOp/DevOps2016Fall_pub_Orgnization/HW4/deploy/deploy-www/ git checkout -f

cd ../deploy-www
pwd
echo "=================build the app image==================="
docker build -t task2-app .
docker run -p 50100:8080 -d --name app task2-app

### deploy to registry
echo "=================push image to local repository==================="
docker tag task2-app localhost:5000/task2-app:latest
docker push localhost:5000/task2-app:latest

echo "=================pull image from local repository==================="
docker pull localhost:5000/task2-app:latest
docker stop app
docker rm app
docker rmi localhost:5000/task2-app:current
docker tag localhost:5000/task2-app:latest localhost:5000/task-app:current
docker run -p 50100:8080 -d --name app localhost:5000/task-app:current
