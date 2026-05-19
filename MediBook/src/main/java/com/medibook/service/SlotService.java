package com.medibook.service;

import com.medibook.dto.SlotResponse;
import com.medibook.entity.*;
import com.medibook.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlotService {

    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private DoctorScheduleRepository scheduleRepository;
    @Autowired private LeaveDateRepository leaveDateRepository;
    @Autowired private DoctorRepository doctorRepository;

    @Transactional
    public List<SlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today) || date.isAfter(today.plusDays(30))) {
            System.out.println(">>> IGNORED - Out of range date: " + date);
            return List.of();
        }

        generateSlotsIfNeeded(doctorId, date);
        List<TimeSlot> slots = timeSlotRepository
                .findByDoctorIdAndSlotDateAndIsBookedFalseAndIsBlockedFalseOrderByStartTime(doctorId, date);

        return slots.stream()
                .map(slot -> {
                    SlotResponse dto = new SlotResponse();
                    dto.setId(slot.getId());
                    dto.setDoctorId(slot.getDoctor().getId());
                    dto.setSlotDate(slot.getSlotDate());
                    dto.setStartTime(slot.getStartTime());
                    dto.setEndTime(slot.getEndTime());
                    dto.setIsBooked(slot.getIsBooked());
                    dto.setIsBlocked(slot.getIsBlocked());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public void generateSlotsIfNeeded(Long doctorId, LocalDate date) {
        if (leaveDateRepository.existsByDoctorIdAndLeaveDate(doctorId, date)) return;

        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow();
        String dayName = date.getDayOfWeek().name();

        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorIdAndIsActiveTrue(doctorId);
        for (DoctorSchedule schedule : schedules) {
            if (schedule.getDayOfWeek().name().equalsIgnoreCase(dayName)) {
                generateSlots(doctor, schedule, date);
                break;
            }
        }
    }

    private void generateSlots(Doctor doctor, DoctorSchedule schedule, LocalDate date) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime start = LocalTime.parse(schedule.getStartTime(), fmt);
        LocalTime end   = LocalTime.parse(schedule.getEndTime(), fmt);
        int duration = schedule.getSlotDurationMinutes();

        LocalTime current = start;
        while (current.plusMinutes(duration).compareTo(end) <= 0) {
            if (!timeSlotRepository.existsByDoctorIdAndSlotDateAndStartTime(doctor.getId(), date, current)) {
                TimeSlot slot = new TimeSlot();
                slot.setDoctor(doctor);
                slot.setSlotDate(date);
                slot.setStartTime(current);
                slot.setEndTime(current.plusMinutes(duration));
                slot.setIsBooked(false);
                slot.setIsBlocked(false);
                timeSlotRepository.save(slot);
            }
            current = current.plusMinutes(duration);
        }
    }

    public TimeSlot blockSlot(Long slotId) {
        TimeSlot slot = timeSlotRepository.findById(slotId).orElseThrow();
        slot.setIsBlocked(true);
        return timeSlotRepository.save(slot);
    }
}