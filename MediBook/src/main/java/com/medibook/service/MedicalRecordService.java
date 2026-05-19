package com.medibook.service;

import com.medibook.entity.*;
import com.medibook.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    @Autowired private MedicalRecordRepository medicalRecordRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DoctorRepository doctorRepository;

    @Transactional
    public Map<String, Object> addRecord(Long appointmentId, String diagnosis,
                                         String consultationNotes, String followUpDateStr,
                                         User doctorUser) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Doctor doctor = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        MedicalRecord record = new MedicalRecord();
        record.setAppointment(appointment);
        record.setPatient(appointment.getPatient());
        record.setDoctor(doctor);
        if (diagnosis != null && !diagnosis.isEmpty()) record.setDiagnosis(diagnosis);
        if (consultationNotes != null && !consultationNotes.isEmpty()) record.setConsultationNotes(consultationNotes);
        if (followUpDateStr != null && !followUpDateStr.isEmpty()) record.setFollowUpDate(LocalDate.parse(followUpDateStr));

        medicalRecordRepository.save(record);

        // Return custom response
        Map<String, Object> result = new HashMap<>();
        result.put("id", record.getId());
        result.put("diagnosis", record.getDiagnosis());
        result.put("consultationNotes", record.getConsultationNotes());
        result.put("followUpDate", record.getFollowUpDate());
        result.put("appointmentDate", appointment.getAppointmentDate());
        result.put("doctorName", "Dr. " + appointment.getDoctor().getUser().getFullName());
        result.put("patientName", appointment.getPatient().getFullName());
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPatientRecords(Long patientId) {
        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        return records.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("diagnosis", r.getDiagnosis());
            map.put("consultationNotes", r.getConsultationNotes());
            map.put("followUpDate", r.getFollowUpDate());
            map.put("createdAt", r.getCreatedAt());

            Doctor doc = r.getDoctor();
            if (doc != null) {
                Map<String, Object> docMap = new HashMap<>();
                docMap.put("fullName", doc.getUser() != null ? doc.getUser().getFullName() : "N/A");
                docMap.put("specialization", doc.getSpecializations().stream()
                        .findFirst().map(Specialization::getName).orElse("N/A"));
                map.put("doctor", docMap);
            }

            Appointment apt = r.getAppointment();
            if (apt != null) {
                map.put("appointmentDate", apt.getAppointmentDate());
                map.put("appointmentTime", apt.getAppointmentTime());
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getByAppointment(Long appointmentId) {
        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId).orElse(null);
        if (record == null) return null;
        return getPatientRecords(record.getPatient().getId()).stream()
                .filter(r -> r.get("id").equals(record.getId()))
                .findFirst().orElse(null);
    }
}