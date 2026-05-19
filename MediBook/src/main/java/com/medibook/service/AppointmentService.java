package com.medibook.service;

import com.medibook.dto.AppointmentRequest;
import com.medibook.entity.*;
import com.medibook.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private FamilyMemberRepository familyMemberRepository;
    @Autowired private NotificationService notificationService;

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request, User patient) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        TimeSlot slot = timeSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getIsBooked() || slot.getIsBlocked()) {
            throw new RuntimeException("Slot is not available");
        }

        Appointment appointment = new Appointment();
        appointment.setBookingId("MB" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setAppointmentDate(slot.getSlotDate());
        appointment.setAppointmentTime(slot.getStartTime());
        appointment.setReasonForVisit(request.getReasonForVisit());
        appointment.setStatus(Appointment.Status.PENDING);

        if (request.getFamilyMemberId() != null) {
            FamilyMember fm = familyMemberRepository.findById(request.getFamilyMemberId()).orElse(null);
            appointment.setFamilyMember(fm);
        }

        slot.setIsBooked(true);
        timeSlotRepository.save(slot);

        Appointment saved = appointmentRepository.save(appointment);
        notificationService.createNotification(
            doctor.getUser(),
            "New Appointment Booked",
            "Patient " + patient.getFullName() + " booked an appointment for " + slot.getSlotDate(),
            Notification.NotificationType.BOOKING_CONFIRMED
        );

        return saved;
    }

    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateAscAppointmentTimeAsc(doctorId);
    }

    public List<Appointment> getDoctorTodayAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, LocalDate.now());
    }

    @Transactional
    public Appointment updateStatus(Long appointmentId, Appointment.Status status, User currentUser) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);

        if (status == Appointment.Status.CANCELLED) {
            TimeSlot slot = appointment.getSlot();
            slot.setIsBooked(false);
            timeSlotRepository.save(slot);
        }

        return appointmentRepository.save(appointment);
    }

    public Appointment getByBookingId(String bookingId) {
        return appointmentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
}