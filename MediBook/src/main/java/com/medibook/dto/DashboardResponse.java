package com.medibook.dto;

import java.math.BigDecimal;

public class DashboardResponse {

    private Long totalPatients;
    private Long totalDoctors;
    private Long totalAppointments;
    private BigDecimal totalRevenue;
    private BigDecimal monthRevenue;
    private Long pendingDoctors;
    private Long todayAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;

    public DashboardResponse() 
    {
    	
    }

    public Long getTotalPatients()
    {
    	return totalPatients; 
    }
    public void setTotalPatients(Long totalPatients) 
    {
    	this.totalPatients = totalPatients; 
    }
    public Long getTotalDoctors() 
    {
    	return totalDoctors; 
    }
    public void setTotalDoctors(Long totalDoctors) 
    {
    	this.totalDoctors = totalDoctors;
    }
    public Long getTotalAppointments() 
    {
    	return totalAppointments; 
    }
    public void setTotalAppointments(Long totalAppointments)
    {
    	this.totalAppointments = totalAppointments; 
    }
    public BigDecimal getTotalRevenue() 
    {
    	return totalRevenue; 
    }
    public void setTotalRevenue(BigDecimal totalRevenue) 
    {
    	this.totalRevenue = totalRevenue; 
    }
    public BigDecimal getMonthRevenue()
    { 
    	return monthRevenue;
    }
    public void setMonthRevenue(BigDecimal monthRevenue) 
    { 
    	this.monthRevenue = monthRevenue;
    }
    public Long getPendingDoctors()
    {
    	return pendingDoctors; 
    }
    public void setPendingDoctors(Long pendingDoctors)
    {
    	this.pendingDoctors = pendingDoctors;
    }
    public Long getTodayAppointments() 
    {
    	return todayAppointments; 
    }
    public void setTodayAppointments(Long todayAppointments) 
    {
    	this.todayAppointments = todayAppointments;
    }
    public Long getCompletedAppointments()
    { 
    	return completedAppointments; 
    }
    public void setCompletedAppointments(Long completedAppointments) 
    {
    	this.completedAppointments = completedAppointments;
    }
    public Long getCancelledAppointments() 
    {
    	return cancelledAppointments; 
    }
    public void setCancelledAppointments(Long cancelledAppointments) 
    {
    	this.cancelledAppointments = cancelledAppointments;
    }
}