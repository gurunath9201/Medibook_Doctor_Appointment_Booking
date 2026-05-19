package com.medibook.repository;
import com.medibook.entity.LeaveDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
@Repository
public interface LeaveDateRepository extends JpaRepository<LeaveDate, Long> {
    List<LeaveDate> findByDoctorIdAndLeaveDateGreaterThanEqual(Long doctorId, LocalDate date);
    boolean existsByDoctorIdAndLeaveDate(Long doctorId, LocalDate date);
}