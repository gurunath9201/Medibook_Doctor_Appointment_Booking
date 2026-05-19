package com.medibook.service;

import com.medibook.entity.*;
import com.medibook.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminService {

    @Autowired private DoctorRepository doctorRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private SpecializationRepository specializationRepository;
    @Autowired private ClinicRepository clinicRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalDoctors = doctorRepository.countByIsApprovedTrue();
        long totalPatients = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getName() == Role.RoleName.ROLE_PATIENT))
                .count();
        long totalAppointments = appointmentRepository.count();
        long pendingDoctors = doctorRepository.findByIsApprovedFalse().size();
        LocalDateTime startOfTime = LocalDateTime.of(2020, 1, 1, 0, 0);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        BigDecimal totalRevenue = paymentRepository.sumByDateRange(startOfTime, now);
        BigDecimal monthRevenue = paymentRepository.sumByDateRange(monthStart, now);
        stats.put("totalDoctors", totalDoctors);
        stats.put("totalPatients", totalPatients);
        stats.put("totalAppointments", totalAppointments);
        stats.put("pendingDoctors", pendingDoctors);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        stats.put("monthRevenue", monthRevenue != null ? monthRevenue : BigDecimal.ZERO);
        return stats;
    }

    public List<Doctor> getAllDoctors() { return doctorRepository.findAll(); }
    public List<Doctor> getPendingDoctors() { return doctorRepository.findByIsApprovedFalse(); }

    public void approveDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setIsApproved(true);
        doctor.setIsAvailable(true);
        doctorRepository.save(doctor);
    }

    public void rejectDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setIsApproved(false);
        doctor.setIsAvailable(false);
        doctorRepository.save(doctor);
    }

    public void toggleDoctorAvailability(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setIsAvailable(!doctor.getIsAvailable());
        doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor addDoctor(Map<String, Object> body) {
        String email = body.get("email").toString();
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered: " + email);
        }

        User user = new User();
        user.setFullName(body.get("fullName").toString());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(body.get("password").toString()));
        user.setPhone(body.getOrDefault("phone", "").toString());
        user.setCity(body.getOrDefault("city", "").toString());
        user.setState(body.getOrDefault("state", "").toString());
        user.setIsActive(true);
        user.setIsEmailVerified(true);

        Role doctorRole = roleRepository.findByName(Role.RoleName.ROLE_DOCTOR)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRoles(new HashSet<>(Collections.singleton(doctorRole)));
        userRepository.save(user);

        Clinic clinic = null;
        String clinicName = body.getOrDefault("clinicName", "").toString();
        if (!clinicName.isBlank()) {
            clinic = new Clinic();
            clinic.setName(clinicName);
            clinic.setAddress(body.getOrDefault("clinicAddress", "N/A").toString());
            clinic.setCity(body.getOrDefault("clinicCity", user.getCity()).toString());
            clinic.setState(user.getState().isBlank() ? "Maharashtra" : user.getState());
            clinicRepository.save(clinic);
        }

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setClinic(clinic);
        doctor.setRegistrationNumber(body.get("registrationNumber").toString());
        doctor.setExperienceYears(Integer.parseInt(body.getOrDefault("experienceYears", "0").toString()));
        doctor.setQualification(body.get("qualification").toString());
        doctor.setBio(body.getOrDefault("bio", "").toString());
        doctor.setLanguagesSpoken(body.getOrDefault("languagesSpoken", "").toString());
        doctor.setConsultationFee(new BigDecimal(body.getOrDefault("consultationFee", "500").toString()));
        doctor.setIsApproved(true);
        doctor.setIsAvailable(true);

        @SuppressWarnings("unchecked")
        List<Integer> specIds = (List<Integer>) body.getOrDefault("specializationIds", new ArrayList<>());
        Set<Specialization> specs = new HashSet<>();
        for (Integer specId : specIds) {
            specializationRepository.findById(specId.longValue()).ifPresent(specs::add);
        }
        doctor.setSpecializations(specs);
        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor updateDoctor(Long doctorId, Map<String, Object> body) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        User user = doctor.getUser();
        if (body.containsKey("fullName")) user.setFullName(body.get("fullName").toString());
        if (body.containsKey("phone"))    user.setPhone(body.get("phone").toString());
        if (body.containsKey("city"))     user.setCity(body.get("city").toString());
        if (body.containsKey("state"))    user.setState(body.get("state").toString());
        userRepository.save(user);

        if (body.containsKey("registrationNumber"))
            doctor.setRegistrationNumber(body.get("registrationNumber").toString());
        if (body.containsKey("experienceYears"))
            doctor.setExperienceYears(Integer.parseInt(body.get("experienceYears").toString()));
        if (body.containsKey("qualification"))
            doctor.setQualification(body.get("qualification").toString());
        if (body.containsKey("bio"))
            doctor.setBio(body.get("bio").toString());
        if (body.containsKey("languagesSpoken"))
            doctor.setLanguagesSpoken(body.get("languagesSpoken").toString());
        if (body.containsKey("consultationFee"))
            doctor.setConsultationFee(new BigDecimal(body.get("consultationFee").toString()));

        @SuppressWarnings("unchecked")
        List<Integer> specIds = (List<Integer>) body.getOrDefault("specializationIds", null);
        if (specIds != null) {
            Set<Specialization> specs = new HashSet<>();
            for (Integer specId : specIds) {
                specializationRepository.findById(specId.longValue()).ifPresent(specs::add);
            }
            doctor.setSpecializations(specs);
        }

        String clinicName = body.getOrDefault("clinicName", "").toString();
        if (!clinicName.isBlank()) {
            Clinic clinic = doctor.getClinic();
            if (clinic == null) clinic = new Clinic();
            clinic.setName(clinicName);
            clinic.setAddress(body.getOrDefault("clinicAddress", "N/A").toString());
            clinic.setCity(body.getOrDefault("clinicCity", user.getCity()).toString());
            clinic.setState(user.getState().isBlank() ? "Maharashtra" : user.getState());
            clinicRepository.save(clinic);
            doctor.setClinic(clinic);
        }

        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Long userId = doctor.getUser().getId();
        doctorRepository.delete(doctor);
        userRepository.deleteById(userId);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}