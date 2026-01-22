package com.beautybynguyenha.booking_system.controller;

import java.util.Map;
import com.beautybynguyenha.booking_system.entity.User;
import com.beautybynguyenha.booking_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private UserRepository userRepository;

    /**
     * For ADMIN and STAFF: Get all users with the role 'CUSTOMER'
     * Uses hasAnyAuthority to be flexible with 'ROLE_' prefixes
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF', 'ADMIN', 'STAFF')")
    public ResponseEntity<List<User>> getAllCustomers() {
        // Fetches all users where role is "CUSTOMER"
        List<User> customers = userRepository.findByRole("CUSTOMER");
        return ResponseEntity.ok(customers);
    }

    /**
     * For CUSTOMERS: Get only their own profile information
     * This is the endpoint called by the "Personal Information" tab
     */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER', 'CUSTOMER', 'ROLE_ADMIN', 'ADMIN', 'ROLE_STAFF', 'STAFF')")
    public ResponseEntity<?> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Basic security check for anonymous sessions
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String email = auth.getName();
        Optional<User> user = userRepository.findByEmail(email);

        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{id}/notes")
    public ResponseEntity<?> updateCustomerNotes(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setNotes(payload.get("notes"));
                    userRepository.save(user);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}