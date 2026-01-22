package com.beautybynguyenha.booking_system.controller;

import com.beautybynguyenha.booking_system.entity.BeautyService;
import com.beautybynguyenha.booking_system.repository.BeautyServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class BeautyServiceController {

    @Autowired
    private BeautyServiceRepository beautyServiceRepository;

    // Everyone can read services
    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(beautyServiceRepository.findAll());
    }

    // Admin only: create service
    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody BeautyService svc, Authentication auth) {
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }

        if (svc.getName() == null || svc.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Service name is required"));
        }
        if (svc.getPrice() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Service price must be > 0"));
        }

        svc.setName(svc.getName().trim());

        // Default icon if missing
        if (svc.getIcon() == null || svc.getIcon().trim().isEmpty()) {
            svc.setIcon("✨");
        }

        return ResponseEntity.ok(beautyServiceRepository.save(svc));
    }

    // Admin only: delete service
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication auth) {
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
        }

        if (!beautyServiceRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Service not found"));
        }

        beautyServiceRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
