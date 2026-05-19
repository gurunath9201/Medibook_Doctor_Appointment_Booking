package com.medibook.controller;

import com.medibook.dto.ApiResponse;
import com.medibook.entity.User;
import com.medibook.service.AuthService;
import com.medibook.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    @Autowired private MedicalRecordService medicalRecordService;
    @Autowired private AuthService authService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyRecords() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(medicalRecordService.getPatientRecords(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional
    public ResponseEntity<?> addRecord(@RequestBody Map<String, Object> body) {
        try {
            User doctorUser = authService.getCurrentUser();
            Long appointmentId = Long.valueOf(body.get("appointmentId").toString());
            String diagnosis = body.get("diagnosis") != null ? body.get("diagnosis").toString() : null;
            String notes = body.get("consultationNotes") != null ? body.get("consultationNotes").toString() : null;
            String followUp = body.get("followUpDate") != null ? body.get("followUpDate").toString() : null;

            return ResponseEntity.ok(
                    medicalRecordService.addRecord(appointmentId, diagnosis, notes, followUp, doctorUser)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(medicalRecordService.getByAppointment(appointmentId));
    }
}