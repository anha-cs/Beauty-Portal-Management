# Stage 1: Build the application using a standard OpenJDK image
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .

# Fix potential line ending issues and give execution rights
RUN sed -i 's/\r$//' ./backend/mvnw
RUN chmod +x ./backend/mvnw

# Run the build directly using the script from inside the backend directory
RUN cd backend && ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]