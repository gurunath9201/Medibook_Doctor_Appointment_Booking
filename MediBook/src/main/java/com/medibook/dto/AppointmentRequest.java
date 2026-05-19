package com.medibook.dto;

import jakarta.validation.constraints.*;

public class AppointmentRequest {
    @NotNull private Long doctorId;
    @NotNull private Long slotId;
    private Long familyMemberId;
    @NotBlank private String appointmentDate;
    @NotBlank private String reasonForVisit;

    public Long getDoctorId() 
    {
    	return doctorId;
    }
    public void setDoctorId(Long doctorId) 
    {
    	this.doctorId = doctorId; 
    }
    public Long getSlotId() 
    {
    	return slotId; 
    }
    public void setSlotId(Long slotId) 
    {
    	this.slotId = slotId;
    }
    public Long getFamilyMemberId()
    {
    	return familyMemberId; 
    }
    public void setFamilyMemberId(Long familyMemberId) 
    {
    	this.familyMemberId = familyMemberId; 
    }
    public String getAppointmentDate()
    {
    	return appointmentDate; 
    }
    public void setAppointmentDate(String appointmentDate) 
    {
    	this.appointmentDate = appointmentDate;
    }
    public String getReasonForVisit() 
    {
    	return reasonForVisit; 
    }
    public void setReasonForVisit(String reasonForVisit)
    {
    	this.reasonForVisit = reasonForVisit; 
    }
}