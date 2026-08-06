#!/bin/sh
sed -i "s/8080/${PORT:-10000}/g" /usr/local/tomcat/conf/server.xml
exec catalina.sh run
