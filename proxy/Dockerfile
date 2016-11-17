# proxy
FROM ubuntu:latest
MAINTAINER Wei Fu, wfu@ncsu.edu

RUN apt-get update
RUN apt-get install -y docker.io
RUN apt-get install -y nodejs
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN apt-get install -y npm
RUN apt-get install git

COPY . /proxy
RUN cd /proxy

RUN npm install
RUN npm install http-server -g
# RUN npm install forever -g
EXPOSE 3000
EXPOSE 8081
WORKDIR /proxy
CMD ["nodejs", "proxy.js"]
