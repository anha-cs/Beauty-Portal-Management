# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .

# Move into the backend directory, clean up line endings, and give execution rights
RUN sed -i 's/\r$//' ./backend/mvnw
RUN chmod +x ./backend/mvnw

# Run the build from inside the backend directory
RUN cd backend && ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Pull the built jar out of the backend/target directory
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]