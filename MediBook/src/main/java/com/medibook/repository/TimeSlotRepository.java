package com.medibook.repository;

import com.medibook.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    List<TimeSlot> findByDoctorIdAndSlotDateAndIsBookedFalseAndIsBlockedFalseOrderByStartTime(
        Long doctorId, LocalDate slotDate);
    List<TimeSlot> findByDoctorIdAndSlotDate(Long doctorId, LocalDate slotDate);
    boolean existsByDoctorIdAndSlotDateAndStartTime(Long doctorId, LocalDate slotDate, java.time.LocalTime startTime);
}