package com.beautybynguyenha.booking_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/test-db")
    public String testConnection() {
        try {
            // This command asks MongoDB for its database name
            String dbName = mongoTemplate.getDb().getName();
            return "✅ Success! Connected to MongoDB database: " + dbName;
        } catch (Exception e) {
            return "❌ Connection Failed: " + e.getMessage();
        }
    }
}