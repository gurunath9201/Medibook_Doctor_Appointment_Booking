package com.medibook.controller;

import com.medibook.dto.ApiResponse;
import com.medibook.entity.User;
import com.medibook.service.AuthService;
import com.medibook.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    @Autowired private NotificationService notificationService;
    @Autowired private AuthService authService;

    @GetMapping
    public ResponseEntity<?> getNotifications() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead() {
        User user = authService.getCurrentUser();
        notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(new ApiResponse(true, "All notifications marked as read"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        try {
            notificationService.markRead(id);
            return ResponseEntity.ok(new ApiResponse(true, "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}