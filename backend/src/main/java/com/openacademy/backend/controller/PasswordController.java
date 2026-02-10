package com.openacademy.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openacademy.backend.dto.UpdatePasswordRequest;
import com.openacademy.backend.service.PasswordService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
public class PasswordController {
    private final PasswordService passwordService;

    @PostMapping("/update/{id}")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<String> updatePassword(@PathVariable Long id, @RequestBody UpdatePasswordRequest request) {
        try {
            passwordService.updatePassword(id, request);
            return ResponseEntity.ok("Password updated successfully");
        } catch (Exception e) {
            return ResponseEntity.ok(e.getMessage());
        }
    }

}
