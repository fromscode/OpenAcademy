package com.openacademy.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openacademy.backend.dto.LoginRequest;
import com.openacademy.backend.dto.LoginResponse;
import com.openacademy.backend.dto.TeacherRegisterRequest;
import com.openacademy.backend.service.LoginService;
import com.openacademy.backend.service.TeacherRegisterService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/auth/teacher")
public class TeacherController {

    @Autowired
    private TeacherRegisterService service;

    @Autowired
    private LoginService loginSerice;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody TeacherRegisterRequest request) {
        if (!request.isValid()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Request");
        }

        try {
            String res = service.registerTeacher(request);
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
            response = loginSerice.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
        }

        catch (Exception e) {
            response.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
