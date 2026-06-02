package com.beautybynguyenha.booking_system.service;

import com.beautybynguyenha.booking_system.entity.Appointment;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    // Pulls your API key securely from your system environment variables just like AuthService
    private final String resendApiKey = System.getenv("RESEND_API_KEY");
    
    private final String ADMIN_EMAIL = "anha@csus.edu"; // Match your working email recipient
    private final String FROM_EMAIL = "onboarding@resend.dev"; // Using the working free-tier sender domain

    public void sendBookingConfirmation(String customerEmail, Appointment appt) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            logger.error("Failed to send booking email: RESEND_API_KEY environment variable is not set.");
            return;
        }

        // Parse date details using your exact AuthService logic
        String[] formattedDateTime = parseDateTime(appt.getDateTime());
        String humanReadableDate = formattedDateTime[0];
        String humanReadableTime = formattedDateTime[1];

        String subject = "✨ New Booking Alert ✨";
        
        String htmlContent = "<h2>✨ New Booking Alert ✨</h2>" +
                "<hr style='border: 0; border-top: 1px solid #ccc;'>" +
                "<p><b>👤 Client:</b> " + appt.getCustomerName() + "</p>" +
                "<p><b>💄 Service:</b> " + appt.getServiceName() + "</p>" +
                "<p><b>📅 Date:</b> " + humanReadableDate + "</p>" +
                "<p><b>🕒 Time:</b> " + humanReadableTime + "</p>" +
                "<p><b>💵 Price:</b> $" + String.format("%.2f", appt.getPrice() != null ? appt.getPrice() : 0.0) + "</p>" +
                "<p><b>📝 Notes:</b> " + (appt.getNotes() != null && !appt.getNotes().trim().isEmpty() ? appt.getNotes() : "N/A") + "</p>";

        // Send alerts to both Admin and Customer
        sendResendHtmlEmail(ADMIN_EMAIL, subject, htmlContent);
        sendResendHtmlEmail(customerEmail, "Booking Confirmation - BeautyByNguyenHa", htmlContent);
    }

    public void sendCancellationConfirmation(String customerEmail, Appointment appt) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            logger.error("Failed to send cancellation email: RESEND_API_KEY environment variable is not set.");
            return;
        }

        String[] formattedDateTime = parseDateTime(appt.getDateTime());
        String humanReadableDate = formattedDateTime[0];
        String humanReadableTime = formattedDateTime[1];

        String subject = "✨ Cancellation Notice ✨";
        
        String htmlContent = "<h2>✨ Appointment Cancelled ✨</h2>" +
                "<hr style='border: 0; border-top: 1px solid #ccc;'>" +
                "<p>The following appointment has been cancelled:</p>" +
                "<p><b>👤 Client:</b> " + appt.getCustomerName() + "</p>" +
                "<p><b>💄 Service:</b> " + appt.getServiceName() + "</p>" +
                "<p><b>📅 Date:</b> " + humanReadableDate + "</p>" +
                "<p><b>🕒 Time:</b> " + humanReadableTime + "</p>" +
                "<p><i>Please update your records accordingly.</i></p>";

        sendResendHtmlEmail(ADMIN_EMAIL, subject, htmlContent);
        sendResendHtmlEmail(customerEmail, subject, htmlContent);
    }

    /**
     * Shared helper to dispatch HTML emails via Resend API
     */
    private void sendResendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            Resend resend = new Resend(resendApiKey);

            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(FROM_EMAIL)
                    .to(to)
                    .subject(subject)
                    .html(htmlBody)
                    .build();

            CreateEmailResponse response = resend.emails().send(options);
            if (response != null && response.getId() != null) {
                logger.info("Email successfully sent to [{}] with Subject: {}", to, subject);
            } else {
                logger.error("Failed to confirm email delivery via Resend API to: {}", to);
            }
        } catch (Exception e) {
            logger.error("Exception caught while sending email to [{}]: {}", to, e.getMessage());
        }
    }

    /**
     * Reusable logic extracted from your working AuthService date handler
     */
    private String[] parseDateTime(String rawDateTime) {
        String humanReadableDate = "N/A";
        String humanReadableTime = "N/A";
        try {
            if (rawDateTime != null && !rawDateTime.isEmpty()) {
                Instant instant = Instant.parse(rawDateTime);
                ZonedDateTime zonedDateTime = instant.atZone(ZoneId.of("America/Los_Angeles"));
                
                humanReadableDate = zonedDateTime.format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
                humanReadableTime = zonedDateTime.format(DateTimeFormatter.ofPattern("h:mm a"));
            }
        } catch (Exception e) {
            logger.warn("Could not parse appointment date string, falling back to raw value: {}", e.getMessage());
            humanReadableDate = rawDateTime;
        }
        return new String[]{humanReadableDate, humanReadableTime};
    }
}