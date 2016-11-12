# app
FROM node:4-onbuild
MAINTAINER Wei Fu, wfu@ncsu.edu

COPY . /app
RUN cd /app
RUN npm install
EXPOSE 3000
WORKDIR /app
CMD ["nodejs", "app.js"]