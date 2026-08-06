# start from an official image that already has Tomcat 9 + Java installed
FROM tomcat:9.0-jdk17

# copy our built war file in, naming it ROOT.war so the app
# is served at the base url instead of /job-tracker/
COPY target/job-tracker.war /usr/local/tomcat/webapps/ROOT.war

# copy our startup script in
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]