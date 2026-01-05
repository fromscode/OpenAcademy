package com.openacademy.backend.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openacademy.backend.dto.StudentDashboardResponse;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;
import com.openacademy.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/dashboard/student")
public class StudentDashboardController {
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<StudentDashboardResponse> getStudentDashboard(
            @RequestHeader(value = "X-Student-Email", required = false) String studentEmail) {
        
        StudentDashboardResponse response = new StudentDashboardResponse();
        
        // If no email provided in header, return default data
        if (studentEmail == null || studentEmail.isEmpty()) {
            response.setWelcomeMessage("Welcome back to OpenAcademy!");
            response.setStudentName("Student");
            response.setStudentEmail("student@example.com");
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
        
        // Fetch student data from database
        Optional<User> userOptional = userRepository.findByEmailAndRole(studentEmail, Role.STUDENT);
        
        if (userOptional.isEmpty()) {
            response.setWelcomeMessage("Welcome to OpenAcademy!");
            response.setStudentName("Student");
            response.setStudentEmail(studentEmail);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        User student = userOptional.get();
        response.setWelcomeMessage("Welcome back to OpenAcademy, " + student.getFirstName() + "!");
        response.setStudentName(student.getFullName());
        response.setStudentEmail(student.getEmail());
        
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}