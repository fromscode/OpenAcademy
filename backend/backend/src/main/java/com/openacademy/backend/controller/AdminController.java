package com.openacademy.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openacademy.backend.dto.AdminRegisterRequest;
import com.openacademy.backend.dto.LoginRequest;
import com.openacademy.backend.dto.LoginResponse;
import com.openacademy.backend.service.AdminRegisterService;
import com.openacademy.backend.service.LoginService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/auth/admin")
public class AdminController {
    @Autowired
    private AdminRegisterService service;

    @Autowired
    private LoginService loginService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AdminRegisterRequest request) {
        if (request.getEmail() == null || request.getFirstName() == null || request.getLastName() == null
                || request.getPassword() == null || request.getPhoneNumber() == null || request.getRole() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incomplete Request");
        }

        try {
            String res = service.registerAdmin(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = new LoginResponse();

        if (request.getEmail() == null || request.getPassword() == null) {
            response.setMessage("Incomplete Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);    
        }

        try {
            response = loginService.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
        }

        catch (Exception e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
}
