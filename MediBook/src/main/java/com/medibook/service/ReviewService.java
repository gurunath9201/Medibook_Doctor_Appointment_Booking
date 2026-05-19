package com.medibook.service;

import com.medibook.dto.ReviewRequest;
import com.medibook.entity.Appointment;
import com.medibook.entity.Doctor;
import com.medibook.entity.Review;
import com.medibook.entity.User;
import com.medibook.repository.AppointmentRepository;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DoctorRepository doctorRepository;

    @Transactional   
    public Review submitReview(ReviewRequest request, User patient) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != Appointment.Status.COMPLETED) {
            throw new RuntimeException("You can only review completed appointments");
        }
        if (reviewRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new RuntimeException("You have already reviewed this appointment");
        }

        Review review = new Review();
        review.setAppointment(appointment);
        review.setPatient(patient);
        review.setDoctor(appointment.getDoctor());
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());
        review.setIsVisible(true);

        Review saved = reviewRepository.save(review);
        updateDoctorRating(appointment.getDoctor().getId());  
        return saved;
    }

    public List<Review> getDoctorReviews(Long doctorId) {
        return reviewRepository.findByDoctorIdAndIsVisibleTrueOrderByCreatedAtDesc(doctorId);
    }

    @Transactional
    public Review replyToReview(Long reviewId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setDoctorReply(reply);
        return reviewRepository.save(review);
    }

    @Transactional
    public void hideReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setIsVisible(false);
        reviewRepository.save(review);
    }

    private void updateDoctorRating(Long doctorId) {
        Double avg = reviewRepository.avgRatingByDoctorId(doctorId);
        List<Review> reviews = reviewRepository.findByDoctorIdAndIsVisibleTrueOrderByCreatedAtDesc(doctorId);
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor != null && avg != null) {
            doctor.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            doctor.setTotalReviews(reviews.size());
            doctorRepository.save(doctor);
        }
    }
}