package com.beautybynguyenha.booking_system.service;

import com.beautybynguyenha.booking_system.entity.User;
import com.beautybynguyenha.booking_system.repository.UserRepository;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Pulls your API key securely from your system environment variables
    private final String resendApiKey = System.getenv("RESEND_API_KEY");

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
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            logger.error("Failed to send email: RESEND_API_KEY environment variable is not set.");
            return;
        }

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        Resend resend = new Resend(resendApiKey);

        String htmlContent = "<h3>Password Reset Request</h3>" +
                "<p>Hello,</p>" +
                "<p>You requested to reset your password for your Beauty Portal account. Click the link below to set a new password.</p>" +
                "<p><strong>Note that this link expires in 10 minutes:</strong></p>" +
                "<p><a href='" + resetLink + "' style='padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>Reset Password</a></p>" +
                "<p>If you did not request this, please ignore this email.</p>";

        CreateEmailOptions sendEmailRequest = CreateEmailOptions.builder()
                .from("onboarding@resend.dev") // Replace with your verified custom domain once added to Resend
                .to(email)
                .subject("Password Reset Request - BeautyByNguyenHa")
                .html(htmlContent)
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(sendEmailRequest);
            if (response != null && response.getId() != null) {
                logger.info("Reset email successfully sent via Resend to: {}", email);
            } else {
                logger.error("Failed to confirm email delivery via Resend API response.");
            }
        } catch (Exception e) {
            logger.error("Exception caught while dispatching reset email via Resend: {}", e.getMessage());
        }
    }
}