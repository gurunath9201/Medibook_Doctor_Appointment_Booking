package com.medibook.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentResponse {

    private Long id;
    private String bookingId;

    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private BigDecimal consultationFee;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reasonForVisit;
    private String status;

    private String clinicName;
    private String clinicCity;

    private String familyMemberName;
    private String familyMemberRelation;

    private String paymentStatus;

    public AppointmentResponse() 
    {
    	
    }

    public Long getId() 
    {
    	return id; 
    }
    public void setId(Long id) 
    {
    	this.id = id; 
    }
    public String getBookingId()
    {
    	return bookingId; 
    }
    public void setBookingId(String bookingId) 
    {
    	this.bookingId = bookingId;
    }
    public Long getPatientId() 
    {
    	return patientId; 
    }
    public void setPatientId(Long patientId) 
    { 
    	this.patientId = patientId; 
    }
    public String getPatientName() 
    {
    	return patientName; 
    }
    public void setPatientName(String patientName) 
    {
    	this.patientName = patientName; 
    }
    public String getPatientEmail() 
    { 
    	return patientEmail;
    }
    public void setPatientEmail(String patientEmail) 
    {
    	this.patientEmail = patientEmail; 
    }
    public String getPatientPhone() 
    {
    	return patientPhone; 
    }
    public void setPatientPhone(String patientPhone) 
    {
    	this.patientPhone = patientPhone;
    }
    public Long getDoctorId() 
    {
    	return doctorId; 
    }
    public void setDoctorId(Long doctorId)
    {
    	this.doctorId = doctorId;
    }
    public String getDoctorName()
    {
    	return doctorName; 
    }
    public void setDoctorName(String doctorName)
    {
    	this.doctorName = doctorName; 
    } 
    public String getDoctorSpecialization() 
    {
    	return doctorSpecialization; 
    }
    public void setDoctorSpecialization(String doctorSpecialization)
    {
    	this.doctorSpecialization = doctorSpecialization; 
    }
    public BigDecimal getConsultationFee() 
    {
    	return consultationFee;
    }
    public void setConsultationFee(BigDecimal consultationFee)
    {
    	this.consultationFee = consultationFee; 
    }
    public LocalDate getAppointmentDate() 
    {
    	return appointmentDate; 
    }
    public void setAppointmentDate(LocalDate appointmentDate) 
    {
    	this.appointmentDate = appointmentDate; 
    }
    public LocalTime getAppointmentTime() 
    {
    	return appointmentTime; 
    }
    public void setAppointmentTime(LocalTime appointmentTime) 
    {
    	this.appointmentTime = appointmentTime; 
    }
    public String getReasonForVisit()
    {
    	return reasonForVisit;
    }
    public void setReasonForVisit(String reasonForVisit) 
    {
    	this.reasonForVisit = reasonForVisit; 
    }
    public String getStatus() 
    {
    	return status;
    }
    public void setStatus(String status) 
    {
    	this.status = status; 
    }
    public String getClinicName() 
    {
    	return clinicName; 
    }
    public void setClinicName(String clinicName) 
    { 
    	this.clinicName = clinicName;	
    }
    public String getClinicCity() 
    {
    	return clinicCity;
    }
    public void setClinicCity(String clinicCity) 
    {
    	this.clinicCity = clinicCity; 
    }
    public String getFamilyMemberName()
    {
    	return familyMemberName; 
    }
    public void setFamilyMemberName(String familyMemberName) 
    {
    	this.familyMemberName = familyMemberName;
    }
    public String getFamilyMemberRelation()
    {
    	return familyMemberRelation; 
    }
    public void setFamilyMemberRelation(String familyMemberRelation) 
    {
    	this.familyMemberRelation = familyMemberRelation;
    }
    public String getPaymentStatus()
    {
    	return paymentStatus; 
    }
    public void setPaymentStatus(String paymentStatus)
    {
    	this.paymentStatus = paymentStatus; 
    }
}