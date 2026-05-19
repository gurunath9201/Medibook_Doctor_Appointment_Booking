package com.medibook.controller;

import com.medibook.dto.ApiResponse;
import com.medibook.entity.FamilyMember;
import com.medibook.entity.User;
import com.medibook.repository.FamilyMemberRepository;
import com.medibook.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/family-members")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('PATIENT')")
public class FamilyMemberController {

    @Autowired private FamilyMemberRepository familyMemberRepository;
    @Autowired private AuthService authService;

    @GetMapping
    public ResponseEntity<?> getMyFamilyMembers() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(familyMemberRepository.findByPatientId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> addFamilyMember(@RequestBody Map<String, String> body) {
        try {
            User user = authService.getCurrentUser();
            FamilyMember member = new FamilyMember();
            member.setPatient(user);
            member.setFullName(body.get("fullName"));
            member.setRelation(FamilyMember.Relation.valueOf(body.get("relation")));
            if (body.get("gender") != null && !body.get("gender").isEmpty()) {
                member.setGender(FamilyMember.Gender.valueOf(body.get("gender")));
            }
            if (body.get("bloodGroup") != null) {
                member.setBloodGroup(body.get("bloodGroup"));
            }
            return ResponseEntity.ok(familyMemberRepository.save(member));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        try {
            familyMemberRepository.deleteById(id);
            return ResponseEntity.ok(new ApiResponse(true, "Family member removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}