package com.medibook.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class DoctorRegisterRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private String phone;
    private String city;
    private String state;

    @NotBlank
    private String registrationNumber;

    @NotNull
    private Integer experienceYears;

    @NotBlank
    private String qualification;

    private String bio;
    private String languagesSpoken;

    @NotNull
    private BigDecimal consultationFee;

    private List<Long> specializationIds;
    private Long clinicId;

    public DoctorRegisterRequest() 
    {
    	
    }

    public String getFullName() 
    {
    	return fullName; 
    }
    public void setFullName(String fullName) 
    {
    	this.fullName = fullName;
    }
    public String getEmail() 
    {
    	return email; 
    }
    public void setEmail(String email) 
    {
    	this.email = email; 
    }
    public String getPassword() 
    {
    	return password; 
    }
    public void setPassword(String password) 
    {
    	this.password = password; 
    }
    public String getPhone() 
    { 
    	return phone; 
    }
    public void setPhone(String phone)
    { 
    	this.phone = phone;
    }
    public String getCity() 
    {
    	return city;
    }
    public void setCity(String city)
    {
    	this.city = city; 
    }
    public String getState() 
    { 
    	return state; 
    }
    public void setState(String state) 
    {
    	this.state = state; 
    }
    public String getRegistrationNumber()
    {
    	return registrationNumber; 
    }
    public void setRegistrationNumber(String registrationNumber)
    {
    	this.registrationNumber = registrationNumber; 
    }
    public Integer getExperienceYears()
    {
    	return experienceYears; 
    }
    public void setExperienceYears(Integer experienceYears)
    {
    	this.experienceYears = experienceYears; 
    }
    public String getQualification()
    {
    	return qualification; 
    }
    public void setQualification(String qualification)
    {
    	this.qualification = qualification;
    }
    public String getBio()
    {
    	return bio; 
    }
    public void setBio(String bio) 
    {
    	this.bio = bio;
    }
    public String getLanguagesSpoken()
    {
    	return languagesSpoken; 
    }
    public void setLanguagesSpoken(String languagesSpoken) 
    {
    	this.languagesSpoken = languagesSpoken; 
    }
    public BigDecimal getConsultationFee()
    {
    	return consultationFee; 
    }
    public void setConsultationFee(BigDecimal consultationFee) 
    {
    	this.consultationFee = consultationFee;
    }
    public List<Long> getSpecializationIds() 
    {
    	return specializationIds;
    }
    public void setSpecializationIds(List<Long> specializationIds) 
    {
    	this.specializationIds = specializationIds;
    }
    public Long getClinicId() 
    {
    	return clinicId;
    }
    public void setClinicId(Long clinicId)
    {
    	this.clinicId = clinicId; 
    }
}