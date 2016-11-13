FROM ubuntu:14.04
MAINTAINER Wei Fu, wfu@ncsu.edu

RUN apt-get -y update
RUN apt-get -y install socat
RUN echo This is HW4_bonus_legancy > file.txt
CMD socat TCP-LISTEN:9001 SYSTEM:'cat file.txt'
