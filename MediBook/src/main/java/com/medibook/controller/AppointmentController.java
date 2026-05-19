package com.medibook.controller;

import com.medibook.dto.AppointmentRequest;
import com.medibook.dto.ApiResponse;
import com.medibook.entity.Appointment;
import com.medibook.entity.User;
import com.medibook.service.AppointmentService;
import com.medibook.service.AuthService;
import com.medibook.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired private AppointmentService appointmentService;
    @Autowired private AuthService authService;
    @Autowired private EmailService emailService;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        try {
            User patient = authService.getCurrentUser();
            Appointment appointment = appointmentService.bookAppointment(request, patient);
            emailService.sendBookingConfirmation(appointment);
            return ResponseEntity.ok(new ApiResponse(true, "Appointment booked successfully", appointment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getMyAppointments() {
        User patient = authService.getCurrentUser();
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patient.getId()));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id,
                                                @RequestBody(required = false) Map<String, String> body) {
        try {
            User user = authService.getCurrentUser();
            Appointment appointment = appointmentService.updateStatus(id, Appointment.Status.CANCELLED, user);
            emailService.sendCancellationEmail(appointment);
            return ResponseEntity.ok(new ApiResponse(true, "Appointment cancelled", appointment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                           @RequestBody Map<String, String> body) {
        try {
            User user = authService.getCurrentUser();
            Appointment.Status status = Appointment.Status.valueOf(body.get("status"));
            Appointment appointment = appointmentService.updateStatus(id, status, user);
            if (status == Appointment.Status.CANCELLED) {
                emailService.sendCancellationEmail(appointment);
            }
            return ResponseEntity.ok(new ApiResponse(true, "Status updated", appointment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getByBookingId(@PathVariable String bookingId) {
        try {
            return ResponseEntity.ok(appointmentService.getByBookingId(bookingId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}