package com.medibook.controller;

import com.medibook.dto.LoginRequest;
import com.medibook.dto.RegisterRequest;
import com.medibook.dto.ApiResponse;
import com.medibook.dto.JwtResponse;
import com.medibook.entity.OtpToken;
import com.medibook.entity.User;
import com.medibook.repository.OtpTokenRepository;
import com.medibook.repository.UserRepository;
import com.medibook.service.AuthService;
import com.medibook.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private OtpTokenRepository otpTokenRepository;
    @Autowired private EmailService emailService;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse response = authService.registerPatient(request);
        if (response.isSuccess()) return ResponseEntity.ok(response);
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            JwtResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(new ApiResponse(false, "Invalid email or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            return ResponseEntity.ok(authService.getCurrentUser());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "Unauthorized"));
        }
    }

    @PostMapping("/forgot-password")
    @Transactional   
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Email is required"));
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(new ApiResponse(true, "If this email is registered, a reset link has been sent."));
        }
        String token = UUID.randomUUID().toString();
        otpTokenRepository.deleteByUserId(user.getId()); 
        OtpToken otpToken = new OtpToken();
        otpToken.setUser(user);
        otpToken.setOtp(token);
        otpToken.setOtpType(OtpToken.OtpType.PASSWORD_RESET);
        otpToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        otpToken.setIsUsed(false);
        otpTokenRepository.save(otpToken);
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user, resetLink);
        return ResponseEntity.ok(new ApiResponse(true, "Password reset link sent to your email!"));
    }

    @PostMapping("/reset-password")
    @Transactional   
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token       = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Token and password (min 6 chars) are required"));
        }
        OtpToken otpToken = otpTokenRepository
            .findByOtpAndOtpTypeAndIsUsedFalse(token, OtpToken.OtpType.PASSWORD_RESET)
            .orElse(null);
        if (otpToken == null) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Invalid or already used reset link"));
        }
        if (otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Reset link has expired. Please request a new one."));
        }
        User user = otpToken.getUser();   
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpToken.setIsUsed(true);
        otpTokenRepository.save(otpToken);
        return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully!"));
    }
}