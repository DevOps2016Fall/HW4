#!/bin/sh
x=$(docker run -d --link hw4_redis_1:redis hw4_app1)
# docker inspect $x

ip=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' ${x})":3000/"
# echo $ip
sleep 1
redis-cli -h 127.0.0.1 -p 6379 lrange serversList 0 15

