package com.beautybynguyenha.booking_system.service;

import com.beautybynguyenha.booking_system.entity.User;
import com.beautybynguyenha.booking_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    public void processForgotPassword(String email) {
        // 1. Check if user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // 2. Generate a secure random token
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);

        // 3. Set the 10-minute expiry (LocalDateTime.now() + 10 mins)
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(10));

        // 4. Save the user with the new token details
        userRepository.save(user);
        System.out.println("Email User: " + System.getenv("EMAIL_USER"));
        // 5. Send the email
        sendResetEmail(user.getEmail(), token);
    }

    private void sendResetEmail(String email, String token) {
        String resetLink = "http://localhost:4200/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("beautybynguyenha@gmail.com");
        message.setTo(email);
        message.setSubject("Password Reset Request - BeautyByNguyenHa");
        message.setText("Hello,\n\nYou requested to reset your password. Click the link below. " +
                "Note that this link expires in 10 minutes:\n\n" + resetLink);

        mailSender.send(message);
    }
}