# Discord Clone Project

## Prerequisites

- Java 11 or higher

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/csh7733/discord.git
    cd discord/backend
    ```

2. Grant execute permissions to `gradlew`:

    ```bash
    chmod +x gradlew
    ```

3. Build the project:

    ```bash
    ./gradlew build
    ```

4. Run the application:

    ```bash
    ./gradlew bootRun
    ```

The application will start and you can access it at `http://localhost:8080`.

## Using H2 Database

The application uses an embedded H2 database. You can access the H2 console at `http://localhost:8080/h2-console` with the following credentials:

- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: *(leave it blank)*

## Additional Information

This project uses Gradle Wrapper, which means you don't need to have Gradle installed on your system. The wrapper will automatically download and use the correct Gradle version specified in the project.
