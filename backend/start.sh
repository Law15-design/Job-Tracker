#!/bin/sh
# Render gives us a random port number in $PORT
# Tomcat normally only listens on 8080, so we swap it here before starting
sed -i "s/8080/${PORT:-10000}/g" /usr/local/tomcat/conf/server.xml
exec catalina.sh run