package com.beautybynguyenha.booking_system.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "beauty_services")
public class BeautyService {
    @Id
    private String id; // MongoDB uses String IDs (ObjectIds)
    private String name;
    private double price;
    private String icon;

    public BeautyService() {}

    public BeautyService(String name, double price, String icon) {
        this.name = name;
        this.price = price;
        this.icon = icon;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}