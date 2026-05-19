package com.medibook.controller;

import com.medibook.dto.ReviewRequest;
import com.medibook.dto.ApiResponse;
import com.medibook.entity.User;
import com.medibook.service.AuthService;
import com.medibook.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired private ReviewService reviewService;
    @Autowired private AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> submitReview(@Valid @RequestBody ReviewRequest request) {
        try {
            User patient = authService.getCurrentUser();
            return ResponseEntity.ok(reviewService.submitReview(request, patient));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    @Transactional(readOnly = true)  
    public ResponseEntity<?> getDoctorReviews(@PathVariable Long doctorId) {
        return ResponseEntity.ok(reviewService.getDoctorReviews(doctorId));
    }

    @PutMapping("/{id}/reply")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> replyToReview(@PathVariable Long id,
                                            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(reviewService.replyToReview(id, body.get("reply")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> hideReview(@PathVariable Long id) {
        try {
            reviewService.hideReview(id);
            return ResponseEntity.ok(new ApiResponse(true, "Review hidden"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}