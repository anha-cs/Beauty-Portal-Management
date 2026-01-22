package com.beautybynguyenha.booking_system.service;

import com.beautybynguyenha.booking_system.entity.User;
import com.beautybynguyenha.booking_system.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Logs for debugging
        System.out.println("DEBUG: Attempting login for email: " + email);

        // 1. Fetch user from MongoDB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        System.out.println("DEBUG: User found in database!");

        // 2. Format the Role correctly
        String role = user.getRole().toUpperCase();
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

        // 3. Return the Spring Security User object
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(), // This must be the BCrypt hash from DB
                Collections.singletonList(authority)
        );
    }
}