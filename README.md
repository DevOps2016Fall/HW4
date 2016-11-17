# HW4 - Docker Part Deux
In this homework assignmetn, I practiced advanced features related to docker containers.

###Task1 Dokcer Compose [Youtube Demo](https://youtu.be/qUw5p2gXFto)
 
In this task, 

* I have created two dockerfiles for [app](https://github.com/DevOps2016Fall/HW4/blob/master/app/Dockerfile) and [proxy](https://github.com/DevOps2016Fall/HW4/blob/master/proxy/Dockerfile), which will generate two images.
* I have created a [docker-compose file](https://github.com/DevOps2016Fall/HW4/blob/master/docker-compose.yml), which will perform docker-compose to generate a cluster of containers running at the same time.
* In proxy.js, I have implemented a ```spawn```functionality, when each time the url ```\spawn``` is hit, a new ```app``` container will be created and add it into the existing network. After that, the proxy container can also redirect traffic to the new app containers

By running the following command, all the containers will be up for service 

```
docker-compose up
```
__More details about how to run it, please watch youtube demo__


###Task2 Docker Deploy [Youtube Demo](https://youtu.be/L2hofX9AZ_I)

In this task, I have created the following folders/files

```
├── deploy
│   ├── deploy-www
│   │   ├── Dockerfile
│   │   ├── main.js
│   │   └── package.json
│   └── deploy.git
│       ├── HEAD
│       ├── branches
│       ├── config
│       ├── description
│       ├── hooks
│       ├── index
│       ├── info
│       ├── objects
│       └── refs
├── dev
│   └── App
│       ├── Dockerfile
│       ├── main.js
│       └── package.json
```

* Under the ```deploy``` folder, I create a deploy.git repo, which will recieve the codes.
* I creat a [```post-receive```](https://github.com/DevOps2016Fall/HW4/blob/master/deploy/post-receive.sh) file, which will build, push the image into local registory; and then pull the latest image from teh registory, stop, remove previously running container/images, and run the latest container
* NOTE: ALl the codes in the ```post-receive``` file are based on our blue-green deployment workshop.

```
!#!/bin/sh
GIT_WORK_TREE=/Users/WeiFu/Github/Class/DevOp/DevOps2016Fall_pub_Orgnization/HW4/deploy/deploy-www/ git checkout -f

cd ../deploy-www
pwd
echo "=================build the app image==================="
docker build -t task2-app .
docker run -p 50100:8080 -d --name app task2-app

!### deploy to registry
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

```
__More details about how to run it, please watch youtube demo__  

###Task3 File IO [Youtube Demo](https://youtu.be/wx9n-nzHlqk)

In this task, as in the task description, I want to create a container for a legacy application.  But I need access to a file that the legacy app creates.
To complete this task, I did the following steps.
 


* I created a image for container1 to run a command that outputs to a file, where I use socat to expose it over 9001 port


```
FROM ubuntu:14.04
MAINTAINER Wei Fu, wfu@ncsu.edu

RUN apt-get -y update
RUN apt-get -y install socat
RUN echo This is HW4_bonus_legancy > file.txt
CMD socat TCP-LISTEN:9001 SYSTEM:'cat file.txt'

```
* I created another image for container2, which is linked to container1. It will use curl to access the data from container 1

```
FROM ubuntu:14.04
MAINTAINER Wei Fu, wfu@ncsu.edu

RUN apt-get -y update
RUN apt-get -y install curl

```
__More details about how to run it, please watch youtube demo__




