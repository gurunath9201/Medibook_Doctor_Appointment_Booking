package com.medibook.controller;

import com.medibook.dto.PaymentVerifyRequest;
import com.medibook.dto.ApiResponse;
import com.medibook.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createOrder(@PathVariable Long appointmentId) {
        if (appointmentId == null || appointmentId <= 0) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid appointment ID"));
        }
        try {
            return ResponseEntity.ok(paymentService.createOrder(appointmentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest request) {
        try {
            return ResponseEntity.ok(paymentService.verifyPayment(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature(),
                    request.getAppointmentId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPaymentByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(paymentService.getPaymentByAppointment(appointmentId));
    }
}