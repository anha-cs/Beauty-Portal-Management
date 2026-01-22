package com.beautybynguyenha.booking_system.dto.Request;

import lombok.Data;

@Data
public class SignupRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String role; // "CUSTOMER" or "STAFF"

    // Staff-specific fields (null if Customer)
    private String ssn;
    private String dob;
    private String bankRoutingNo;
    private String bankAccountNumber;
}