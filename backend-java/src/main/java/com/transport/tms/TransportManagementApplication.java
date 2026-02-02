package com.transport.tms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TransportManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(TransportManagementApplication.class, args);
        System.out.println("\n" +
                "==============================================\n" +
                "  Transportation Management System (Java)\n" +
                "==============================================\n" +
                "  🚀 Application is running!\n" +
                "  📊 GraphQL Playground: http://localhost:8080/graphiql\n" +
                "  🚀 GraphQL Endpoint: http://localhost:8080/graphql\n" +
                "  📊 Health Check: http://localhost:8080/health\n" +
                "=============================================="
        );
    }
}
