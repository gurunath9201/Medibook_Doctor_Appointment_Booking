package com.medibook.repository;
import com.medibook.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByDoctorIdAndIsVisibleTrueOrderByCreatedAtDesc(Long doctorId);
    boolean existsByAppointmentId(Long appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId AND r.isVisible = true")
    Double avgRatingByDoctorId(@Param("doctorId") Long doctorId);
}