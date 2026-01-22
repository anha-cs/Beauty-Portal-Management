package com.beautybynguyenha.booking_system.entity;

import com.beautybynguyenha.booking_system.dto.Views; // Ensure this points to your Views file
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "users")
public class User {
    @Id
    @JsonView(Views.Public.class)
    private String id;

    @Indexed(unique = true)

    @JsonView(Views.Public.class)
    private String firstName;

    @JsonView(Views.Public.class)
    private String lastName;

    @JsonView(Views.Public.class)
    private String role;

    // STAFF PRIVATE FIELDS - Only for Admins
    @JsonView(Views.Admin.class)
    private String email;

    @JsonView(Views.Admin.class)
    private String phone;

    @JsonView(Views.Admin.class)
    private String ssn;

    @JsonView(Views.Admin.class)
    private String dob;

    @JsonView(Views.Admin.class)
    private String bankRoutingNo;

    @JsonView(Views.Admin.class)
    private String bankAccountNumber;

    @JsonView(Views.Admin.class)
    private String notes;

    // RESET FIELDS - Internal use only, no @JsonView
    private String password;
    private String resetToken;
    private LocalDateTime tokenExpiry;


    public User() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getSsn() { return ssn; }
    public void setSsn(String ssn) { this.ssn = ssn; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getBankRoutingNo() { return bankRoutingNo; }
    public void setBankRoutingNo(String bankRoutingNo) { this.bankRoutingNo = bankRoutingNo; }

    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }

    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }

    public LocalDateTime getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(LocalDateTime tokenExpiry) { this.tokenExpiry = tokenExpiry; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}