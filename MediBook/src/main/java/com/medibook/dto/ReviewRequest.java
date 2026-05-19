package com.medibook.dto;

import jakarta.validation.constraints.*;

public class ReviewRequest {
    @NotNull private Long appointmentId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    private String reviewText;

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
}