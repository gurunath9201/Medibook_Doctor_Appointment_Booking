package com.medibook.service;

import com.medibook.entity.Appointment;
import com.medibook.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.from:noreply@medibook.com}")
    private String fromEmail;

    private void send(String to, String subject, String text) {
        if (mailSender == null) {
            System.out.println("=== EMAIL (no SMTP configured) ===");
            System.out.println("TO: " + to);
            System.out.println("SUBJECT: " + subject);
            System.out.println("BODY: " + text);
            System.out.println("==================================");
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(text);
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(User user, String resetLink) {
        send(user.getEmail(),
            "MediBook - Password Reset Request",
            "Dear " + user.getFullName() + ",\n\n" +
            "We received a request to reset your MediBook password.\n\n" +
            "Click the link below to reset your password (valid for 30 minutes):\n\n" +
            resetLink + "\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Regards,\nMediBook Team"
        );
    }

    @Async
    public void sendBookingConfirmation(Appointment appointment) {
        send(appointment.getPatient().getEmail(),
            "MediBook - Appointment Booked: " + appointment.getBookingId(),
            "Dear " + appointment.getPatient().getFullName() + ",\n\n" +
            "Your appointment has been booked.\n\n" +
            "Booking ID : " + appointment.getBookingId() + "\n" +
            "Doctor     : Dr. " + appointment.getDoctor().getUser().getFullName() + "\n" +
            "Date       : " + appointment.getAppointmentDate() + "\n" +
            "Time       : " + appointment.getAppointmentTime() + "\n\n" +
            "Please complete payment to confirm.\n\nRegards,\nMediBook Team"
        );
    }

    @Async
    public void sendPaymentConfirmation(Appointment appointment) {
        send(appointment.getPatient().getEmail(),
            "MediBook - Payment Confirmed: " + appointment.getBookingId(),
            "Dear " + appointment.getPatient().getFullName() + ",\n\n" +
            "Payment confirmed! Appointment CONFIRMED.\n\n" +
            "Booking ID : " + appointment.getBookingId() + "\n" +
            "Doctor     : Dr. " + appointment.getDoctor().getUser().getFullName() + "\n" +
            "Date       : " + appointment.getAppointmentDate() + "\n" +
            "Time       : " + appointment.getAppointmentTime() + "\n\n" +
            "Regards,\nMediBook Team"
        );
    }

    @Async
    public void sendCancellationEmail(Appointment appointment) {
        send(appointment.getPatient().getEmail(),
            "MediBook - Appointment Cancelled: " + appointment.getBookingId(),
            "Dear " + appointment.getPatient().getFullName() + ",\n\n" +
            "Your appointment (Booking ID: " + appointment.getBookingId() + ") has been cancelled.\n\n" +
            "Regards,\nMediBook Team"
        );
    }

    @Async
    public void sendReminderEmail(Appointment appointment, String timeLabel) {
        send(appointment.getPatient().getEmail(),
            "MediBook - Appointment Reminder (" + timeLabel + ")",
            "Dear " + appointment.getPatient().getFullName() + ",\n\n" +
            "Reminder: Appointment " + timeLabel + ".\n\n" +
            "Doctor : Dr. " + appointment.getDoctor().getUser().getFullName() + "\n" +
            "Date   : " + appointment.getAppointmentDate() + "\n" +
            "Time   : " + appointment.getAppointmentTime() + "\n\n" +
            "Regards,\nMediBook Team"
        );
    }
}