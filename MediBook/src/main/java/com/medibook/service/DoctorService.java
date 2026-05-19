package com.medibook.service;

import com.medibook.entity.Doctor;
import com.medibook.entity.Specialization;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.SpecializationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DoctorService {

    @Autowired private DoctorRepository doctorRepository;
    @Autowired private SpecializationRepository specializationRepository;

    public List<Specialization> getAllSpecializations() {
        return specializationRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    public List<Doctor> searchDoctors(Long specializationId, String name, String city) {
        if (specializationId != null) {
            return doctorRepository.findBySpecializationId(specializationId);
        }
        if (name != null && !name.isEmpty()) {
            return doctorRepository.searchByName(name);
        }
        if (city != null && !city.isEmpty()) {
            return doctorRepository.findByCity(city);
        }
        return doctorRepository.findAll().stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsApproved()) && Boolean.TRUE.equals(d.getIsAvailable()))
                .collect(java.util.stream.Collectors.toList());
    }
}