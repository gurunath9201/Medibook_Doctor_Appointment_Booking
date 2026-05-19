package com.medibook.service;

import com.medibook.entity.Appointment;
import com.medibook.entity.Notification;
import com.medibook.entity.Payment;
import com.medibook.repository.AppointmentRepository;
import com.medibook.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private RazorpayClient razorpayClient;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ----------------------------------------------------------------
    @Transactional
    public Map<String, Object> createOrder(Long appointmentId) throws Exception {
        Map<String, Object> existing = null;
        try {
            existing = jdbcTemplate.queryForMap(
                "SELECT razorpay_order_id, amount, currency FROM payments WHERE appointment_id = ?",
                appointmentId);
        } catch (Exception ignored) {}

        if (existing != null) {
            return buildExistingResponse(appointmentId, existing);
        }

        Map<String, Object> apt = jdbcTemplate.queryForMap(
            "SELECT a.booking_id, d.consultation_fee, u1.full_name AS doctor_name, u2.full_name AS patient_name " +
            "FROM appointments a " +
            "JOIN doctors d ON a.doctor_id = d.id " +
            "JOIN users u1 ON d.user_id = u1.id " +
            "JOIN users u2 ON a.patient_id = u2.id " +
            "WHERE a.id = ?", appointmentId);

        BigDecimal fee = (BigDecimal) apt.get("consultation_fee");
        long amountInPaise = fee.multiply(BigDecimal.valueOf(100)).longValue();
        String bookingId = (String) apt.get("booking_id");

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", bookingId);

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        String orderId = razorpayOrder.get("id");

        try {
            jdbcTemplate.update(
                "INSERT IGNORE INTO payments (appointment_id, razorpay_order_id, amount, currency, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, 'INR', 'PENDING', NOW(), NOW())",
                appointmentId, orderId, fee);
        } catch (Exception ignored) {}

        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", orderId);
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("keyId", razorpayKeyId);
        response.put("appointmentId", appointmentId);
        response.put("doctorName", "Dr. " + apt.get("doctor_name"));
        response.put("patientName", apt.get("patient_name").toString());
        return response;
    }

    private Map<String, Object> buildExistingResponse(Long appointmentId, Map<String, Object> row) {
        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", row.get("razorpay_order_id"));
        long amountInPaise = ((BigDecimal) row.get("amount")).multiply(BigDecimal.valueOf(100)).longValue();
        response.put("amount", amountInPaise);
        response.put("currency", row.get("currency"));

        Map<String, Object> detail = jdbcTemplate.queryForMap(
            "SELECT u1.full_name AS doctor_name, u2.full_name AS patient_name " +
            "FROM appointments a " +
            "JOIN doctors d ON a.doctor_id = d.id " +
            "JOIN users u1 ON d.user_id = u1.id " +
            "JOIN users u2 ON a.patient_id = u2.id " +
            "WHERE a.id = ?", appointmentId);

        response.put("keyId", razorpayKeyId);
        response.put("appointmentId", appointmentId);
        response.put("doctorName", "Dr. " + detail.get("doctor_name"));
        response.put("patientName", detail.get("patient_name").toString());
        return response;
    }

    @Transactional
    public Map<String, Object> verifyPayment(String razorpayOrderId, String razorpayPaymentId,
                                              String razorpaySignature, Long appointmentId) {
        try {
            String generatedSignature = generateSignature(
                    razorpayOrderId + "|" + razorpayPaymentId, razorpayKeySecret);

            if (!generatedSignature.equals(razorpaySignature)) {
                throw new RuntimeException("Payment verification failed - invalid signature");
            }

            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Payment record not found"));

            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus(Payment.Status.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());

            Appointment appointment = payment.getAppointment();
            appointment.setStatus(Appointment.Status.CONFIRMED);
            appointmentRepository.save(appointment);
            paymentRepository.save(payment);

            notificationService.createNotification(
                    appointment.getPatient(),
                    "Payment Successful",
                    "Payment of Rs." + payment.getAmount() + " confirmed for booking #" + appointment.getBookingId(),
                    Notification.NotificationType.PAYMENT_SUCCESS
            );

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Payment verified successfully");
            result.put("bookingId", appointment.getBookingId());
            return result;

        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return result;
        }
    }

    public Payment getPaymentByAppointment(Long appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId).orElse(null);
    }

    private String generateSignature(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes());
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}