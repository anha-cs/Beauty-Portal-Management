package com.beautybynguyenha.booking_system.controller;

import com.beautybynguyenha.booking_system.entity.Appointment;
import com.beautybynguyenha.booking_system.repository.AppointmentRepository;
import com.beautybynguyenha.booking_system.repository.UserRepository;
import com.beautybynguyenha.booking_system.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;


    // ------------------------------------------------------
    // BLOCKS (calendar availability)
    // ------------------------------------------------------

    @GetMapping("/blocks")
    public ResponseEntity<?> getAllBlocks() {
        try {
            return ResponseEntity.ok(appointmentRepository.findBlocks());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/blocks/mine")
    public ResponseEntity<?> getMyBlocks() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            String email = auth.getName();
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            var user = userOpt.get();
            String role = user.getRole();
            if (!"STAFF".equals(role) && !"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access Denied"));
            }

            String myStaffId = String.valueOf(user.getId());
            return ResponseEntity.ok(appointmentRepository.findBlocksByStaffId(myStaffId));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ------------------------------------------------------
    // RECORDS (history) - appointments only (NOT blocks)
    // ------------------------------------------------------

    @GetMapping("/records")
    public ResponseEntity<?> getRecords() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            String email = auth.getName();
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            var user = userOpt.get();
            String myId = String.valueOf(user.getId());
            String role = user.getRole();

            if ("ADMIN".equals(role)) {
                return ResponseEntity.ok(appointmentRepository.findRecordsAll());
            }

            if ("STAFF".equals(role)) {
                return ResponseEntity.ok(appointmentRepository.findRecordsByStaffId(myId));
            }

            return ResponseEntity.ok(appointmentRepository.findRecordsByCustomerId(myId));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ------------------------------------------------------
    // /all (optional admin-only debugging)
    // ------------------------------------------------------

    @GetMapping("/all")
    public ResponseEntity<?> getAllAppointments(Authentication auth) {
        try {
            if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin only"));
            }
            return ResponseEntity.ok(appointmentRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ------------------------------------------------------
    // BOOK (block OR normal appointment)
    // ------------------------------------------------------

    @PostMapping("/book")
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            String bookingEmail = auth.getName();
            var bookingUserOpt = userRepository.findByEmail(bookingEmail);
            if (bookingUserOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            var bookingUser = bookingUserOpt.get();
            String bookingRole = bookingUser.getRole();
            boolean isAdmin = "ADMIN".equals(bookingRole);
            boolean isStaff = "STAFF".equals(bookingRole);
            boolean isBlock = Boolean.TRUE.equals(appointment.getIsBlock());

            // Normalize incoming ids to strings
            if (appointment.getStaffId() != null) appointment.setStaffId(String.valueOf(appointment.getStaffId()));
            if (appointment.getCustomerId() != null) appointment.setCustomerId(String.valueOf(appointment.getCustomerId()));

            // Customers cannot block days
            if (isBlock && !isAdmin && !isStaff) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Customers cannot block days"));
            }

            // Staff can only block their own schedule
            if (isBlock && isStaff && !isAdmin) {
                String myStaffId = String.valueOf(bookingUser.getId());
                if (appointment.getStaffId() == null || !appointment.getStaffId().equals(myStaffId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Staff can only block their own schedule"));
                }
            }

            // ------------------------------------------------------
            // Validate staffId for BOTH blocks and normal appointments
            // and set canonical staffId + staffName
            // ------------------------------------------------------
            if (appointment.getStaffId() == null || appointment.getStaffId().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "staffId is required"));
            }

            var staffOpt = userRepository.findById(appointment.getStaffId());
            if (staffOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid staffId (must be Staff User _id string)"));
            }

            var staffUser = staffOpt.get();

            appointment.setStaffId(String.valueOf(staffUser.getId()));

            if (appointment.getStaffName() == null || appointment.getStaffName().isBlank()) {
                appointment.setStaffName(staffUser.getFirstName());
            }

            // BLOCK
            if (isBlock) {
                appointment.setIsBlock(true);
                appointment.setStatus("BLOCKED");

                // for blocks, customer info isn't important
                if (appointment.getServiceName() == null) appointment.setServiceName("Unavailable");
                if (appointment.getCustomerName() == null) appointment.setCustomerName("N/A (Staff Block)");

                Appointment saved = appointmentRepository.save(appointment);
                return ResponseEntity.ok(saved);
            }

            // NORMAL APPOINTMENT
            appointment.setIsBlock(false);
            appointment.setStatus("PENDING");

            // CustomerId normalization
            // Inside the "if (!isAdmin)" block
            if (!isAdmin) {
                // customer booking themselves
                appointment.setCustomerId(String.valueOf(bookingUser.getId()));
                appointment.setCustomerEmail(bookingUser.getEmail());
                appointment.setCustomerPhone(bookingUser.getPhone());

                String dbName = bookingUser.getFirstName();
                if (bookingUser.getLastName() != null && !bookingUser.getLastName().isBlank()) {
                    dbName += " " + bookingUser.getLastName();
                }
                appointment.setCustomerName(dbName);
            } else {
                // admin booking for customer: must pass customerId as USER _id string
                if (appointment.getCustomerId() == null || appointment.getCustomerId().isBlank()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "customerId is required for admin booking"));
                }

                var custOpt = userRepository.findById(appointment.getCustomerId());
                if (custOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid customerId (must be Customer User _id string)"));
                }

                var custUser = custOpt.get();
                appointment.setCustomerId(String.valueOf(custUser.getId()));
                appointment.setCustomerEmail(custUser.getEmail());
                appointment.setCustomerPhone(custUser.getPhone());

                String firstName = custUser.getFirstName() != null ? custUser.getFirstName() : "";
                String lastName = custUser.getLastName() != null ? custUser.getLastName() : "";
                String fullName = (firstName + " " + lastName).trim();

                appointment.setCustomerName(fullName);
            }

            Appointment saved = appointmentRepository.save(appointment);
            authService.sendBookingSms(saved);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ------------------------------------------------------
    // DELETE: used for UNBLOCK only
    // ------------------------------------------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            String email = auth.getName();
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            var user = userOpt.get();
            boolean isAdmin = "ADMIN".equals(user.getRole());
            boolean isStaff = "STAFF".equals(user.getRole());

            var apptOpt = appointmentRepository.findById(id);
            if (apptOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Not found"));
            }

            Appointment appt = apptOpt.get();
            boolean blocked = Boolean.TRUE.equals(appt.getIsBlock()) || "BLOCKED".equals(appt.getStatus());
            if (!blocked) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only blocked items can be removed here"));
            }

            if (isAdmin) {
                appointmentRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Unblocked"));
            }

            if (isStaff) {
                String myStaffId = String.valueOf(user.getId());
                if (myStaffId.equals(String.valueOf(appt.getStaffId()))) {
                    appointmentRepository.deleteById(id);
                    return ResponseEntity.ok(Map.of("message", "Unblocked"));
                }
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Cannot unblock other staff schedule"));
            }

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ------------------------------------------------------
    // UPDATE STATUS (appointments only; blocks forbidden)
    // ------------------------------------------------------

    @PostMapping("/update-status")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, String> payload) {
        String id = payload.get("id");
        String newStatus = payload.get("status");

        return appointmentRepository.findById(id)
                .map(appointment -> {
                    boolean blocked = Boolean.TRUE.equals(appointment.getIsBlock()) || "BLOCKED".equals(appointment.getStatus());
                    if (blocked) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Cannot update status for blocked days"));
                    }

                    appointment.setStatus(newStatus);
                    appointmentRepository.save(appointment);

                    return ResponseEntity.ok(Map.of(
                            "message", "Status updated successfully",
                            "id", id,
                            "status", newStatus
                    ));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("error", "Appointment not found")));
    }
}
