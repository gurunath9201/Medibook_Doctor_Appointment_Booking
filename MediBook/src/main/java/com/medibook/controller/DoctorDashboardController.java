package com.medibook.controller;

import com.medibook.dto.ApiResponse;
import com.medibook.dto.DoctorResponse;
import com.medibook.entity.Appointment;
import com.medibook.entity.Doctor;
import com.medibook.entity.DoctorSchedule;
import com.medibook.entity.LeaveDate;
import com.medibook.entity.User;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.DoctorScheduleRepository;
import com.medibook.repository.LeaveDateRepository;
import com.medibook.service.AppointmentService;
import com.medibook.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorDashboardController {

    @Autowired private DoctorRepository doctorRepository;
    @Autowired private DoctorScheduleRepository scheduleRepository;
    @Autowired private LeaveDateRepository leaveDateRepository;
    @Autowired private AuthService authService;
    @Autowired private AppointmentService appointmentService;

    private Doctor getCurrentDoctor() {
        User user = authService.getCurrentUser();
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Doctor doctor = getCurrentDoctor();
        DoctorResponse dto = new DoctorResponse();
        dto.setId(doctor.getId());
        dto.setUserId(doctor.getUser().getId());
        dto.setFullName(doctor.getUser().getFullName());
        dto.setEmail(doctor.getUser().getEmail());
        dto.setPhone(doctor.getUser().getPhone());
        dto.setCity(doctor.getUser().getCity());
        dto.setState(doctor.getUser().getState());
        dto.setProfilePhoto(doctor.getUser().getProfilePhoto());
        dto.setRegistrationNumber(doctor.getRegistrationNumber());
        dto.setExperienceYears(doctor.getExperienceYears());
        dto.setQualification(doctor.getQualification());
        dto.setBio(doctor.getBio());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setLanguagesSpoken(doctor.getLanguagesSpoken());
        dto.setAverageRating(doctor.getAverageRating());
        dto.setTotalReviews(doctor.getTotalReviews());
        dto.setIsApproved(doctor.getIsApproved());
        dto.setIsAvailable(doctor.getIsAvailable());
        dto.setClinicName(doctor.getClinic() != null ? doctor.getClinic().getName() : null);
        dto.setClinicCity(doctor.getClinic() != null ? doctor.getClinic().getCity() : null);
        dto.setSpecializations(doctor.getSpecializations().stream()
                .map(s -> s.getName())
                .collect(Collectors.toList()));
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments() {
        Doctor doctor = getCurrentDoctor();
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctor.getId()));
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User user = authService.getCurrentUser();
            Appointment.Status status = Appointment.Status.valueOf(body.get("status"));
            Appointment appointment = appointmentService.updateStatus(id, status, user);
            return ResponseEntity.ok(new ApiResponse(true, "Status updated", appointment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule() {
        Doctor doctor = getCurrentDoctor();
        return ResponseEntity.ok(scheduleRepository.findByDoctorIdAndIsActiveTrue(doctor.getId()));
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> saveSchedule(@RequestBody Map<String, Object> body) {
        try {
            Doctor doctor = getCurrentDoctor();
            List<DoctorSchedule> existing = scheduleRepository.findByDoctorIdAndIsActiveTrue(doctor.getId());
            scheduleRepository.deleteAll(existing);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> schedules = (List<Map<String, Object>>) body.get("schedules");

            for (Map<String, Object> s : schedules) {
                DoctorSchedule schedule = new DoctorSchedule();
                schedule.setDoctor(doctor);
                schedule.setDayOfWeek(DoctorSchedule.DayOfWeek.valueOf(s.get("dayOfWeek").toString()));
                schedule.setStartTime(s.get("startTime").toString());
                schedule.setEndTime(s.get("endTime").toString());
                schedule.setSlotDurationMinutes(Integer.valueOf(s.get("slotDurationMinutes").toString()));
                schedule.setMaxPatients(Integer.valueOf(s.get("maxPatients").toString()));
                schedule.setIsActive(true);
                scheduleRepository.save(schedule);
            }
            return ResponseEntity.ok(new ApiResponse(true, "Schedule saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/leave")
    public ResponseEntity<?> addLeave(@RequestBody Map<String, String> body) {
        try {
            Doctor doctor = getCurrentDoctor();
            LeaveDate leave = new LeaveDate();
            leave.setDoctor(doctor);
            leave.setLeaveDate(LocalDate.parse(body.get("leaveDate")));
            if (body.get("reason") != null) {
                leave.setReason(body.get("reason"));
            }
            return ResponseEntity.ok(leaveDateRepository.save(leave));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}