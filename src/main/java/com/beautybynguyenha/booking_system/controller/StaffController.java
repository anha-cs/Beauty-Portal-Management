package com.beautybynguyenha.booking_system.controller;

import com.beautybynguyenha.booking_system.dto.Views;
import com.beautybynguyenha.booking_system.repository.UserRepository;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    /**
     * GET current logged-in profile.
     * Uses Admin view so the staff member can see their own private info.
     */
    @JsonView(Views.Admin.class)
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String email = auth.getName();

        return userRepository.findByEmail(email)
                .map(user -> {
                    if (!"STAFF".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
                    }
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    /**
     * PUBLIC endpoint for Customers.
     * Only returns ID, First Name, Last Name, and Role.
     */
    @JsonView(Views.Public.class)
    @GetMapping("/all")
    public ResponseEntity<?> getAllStaffPublic() {
        // No security check here so customers can see the list to book
        return ResponseEntity.ok(userRepository.findByRole("STAFF"));
    }

    /**
     * PRIVATE endpoint for Admins.
     * Returns full details (SSN, Bank Info, Phone, etc.)
     */
    @JsonView(Views.Admin.class)
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllStaffAdmin(Authentication auth) {
        // Strict Admin check
        if (auth == null || !auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Admin only");
        }

        return ResponseEntity.ok(userRepository.findByRole("STAFF"));
    }
}