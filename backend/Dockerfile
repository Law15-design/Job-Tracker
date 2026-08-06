# STAGE 1: build the war file from source, using an image that has maven installed
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# STAGE 2: take just the built war file and put it into a clean tomcat image
FROM tomcat:9.0-jdk17
COPY --from=build /app/target/job-tracker.war /usr/local/tomcat/webapps/ROOT.war
COPY start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 10000
CMD ["/start.sh"]
