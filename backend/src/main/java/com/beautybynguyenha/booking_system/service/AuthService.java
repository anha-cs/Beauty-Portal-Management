package com.beautybynguyenha.booking_system.service;

import com.beautybynguyenha.booking_system.entity.User;
import com.beautybynguyenha.booking_system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

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
        logger.info("Reset token generated for user: {}", email);

        // 5. Send the email
        sendResetEmail(user.getEmail(), token);
    }

    private void sendResetEmail(String email, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Password Reset Request - BeautyByNguyenHa");
        message.setText("Hello,\n\nYou requested to reset your password. Click the link below. " +
                "Note that this link expires in 10 minutes:\n\n" + resetLink);

        mailSender.send(message);
        logger.info("Reset email successfully sent to: {}", email);
    }
}