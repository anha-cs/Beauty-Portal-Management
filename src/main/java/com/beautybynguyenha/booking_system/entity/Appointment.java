package com.beautybynguyenha.booking_system.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointments")
public class Appointment {
    @Id
    private String id;

    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String staffId;
    private String staffName;

    private String serviceName;
    private String dateTime;

    private String location;
    private String notes;

    private String status; // PENDING, DONE, CANCELLED, BLOCKED
    private Double price;

    // Fields for Syncfusion Logic
    private boolean isBlock = false; // true if staff is "Off"
    private String subject;          // Display text on the calendar

    public Appointment() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getDateTime() { return dateTime; }
    public void setDateTime(String dateTime) { this.dateTime = dateTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public boolean getIsBlock() { return isBlock; }
    public void setIsBlock(boolean isBlock) { this.isBlock = isBlock; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}
