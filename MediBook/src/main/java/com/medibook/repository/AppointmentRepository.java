package com.medibook.repository;

import com.medibook.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateAscAppointmentTimeAsc(Long doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);
    Optional<Appointment> findByBookingId(String bookingId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.status != 'CANCELLED'")
    long countByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    long count();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate >= :from AND a.appointmentDate <= :to")
    long countByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);
}