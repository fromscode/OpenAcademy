package com.openacademy.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openacademy.backend.dto.StudentRegisterRequest;
import com.openacademy.backend.service.StudentRegisterService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/auth/student")
public class StudentController {

    @Autowired
    private StudentRegisterService service;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody StudentRegisterRequest request) {

        if (request.getEmail() == null || request.getFirstName() == null
        || request.getLastName() == null || request.getPassword() == null
        || request.getPhoneNumber() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Incomplete Request");
        }

        try {
            String result = service.registerStudent(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(result);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(e.getMessage());
        }
    }
}
