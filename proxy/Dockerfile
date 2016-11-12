# proxy
FROM node:4-onbuild
MAINTAINER Wei Fu, wfu@ncsu.edu

COPY . /proxy
RUN cd /proxy
RUN npm install
RUN npm install http-server -g
RUN npm install forever -g
EXPOSE 3000
EXPOSE 8081
WORKDIR /proxy
CMD ["nodejs", "proxy.js"]
