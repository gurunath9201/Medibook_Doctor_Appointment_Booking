package com.medibook.repository;

import com.medibook.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);

    @Query("SELECT d FROM Doctor d JOIN d.specializations s WHERE s.id = :specId AND d.isApproved = true AND d.isAvailable = true")
    List<Doctor> findBySpecializationId(@Param("specId") Long specId);

    @Query("SELECT d FROM Doctor d WHERE d.isApproved = true AND d.isAvailable = true AND " +
           "(LOWER(d.user.fullName) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<Doctor> searchByName(@Param("name") String name);

    @Query("SELECT d FROM Doctor d WHERE d.isApproved = true AND d.isAvailable = true AND LOWER(d.user.city) = LOWER(:city)")
    List<Doctor> findByCity(@Param("city") String city);

    List<Doctor> findByIsApprovedFalse();

    long countByIsApprovedTrue();
}