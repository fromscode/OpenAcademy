package com.openacademy.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.openacademy.backend.dto.CreateAdminRequest;
import com.openacademy.backend.dto.CreateStudentRequest;
import com.openacademy.backend.dto.CreateTeacherRequest;
import com.openacademy.backend.dto.UpdateAdminRequest;
import com.openacademy.backend.dto.UpdateStudentRequest;
import com.openacademy.backend.dto.UpdateTeacherRequest;
import com.openacademy.backend.entities.Admin;
import com.openacademy.backend.entities.Student;
import com.openacademy.backend.entities.Teacher;
import com.openacademy.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // --- VIEW ---

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }

    // --- CREATE ---

    @PostMapping("/teachers")
    public ResponseEntity<Teacher> createTeacher(@RequestBody CreateTeacherRequest request) {
        return ResponseEntity.ok(adminService.createTeacher(request));
    }

    @PostMapping("/students")
    public ResponseEntity<Student> createStudent(@RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(adminService.createStudent(request));
    }

    @PostMapping("/admins")
    public ResponseEntity<Admin> createAdmin(@RequestBody CreateAdminRequest request) {
        return ResponseEntity.ok(adminService.createAdmin(request));
    }

    // --- UPDATE ---

    @PutMapping("/teachers/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @RequestBody UpdateTeacherRequest request) {
        return ResponseEntity.ok(adminService.updateTeacher(id, request));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(adminService.updateStudent(id, request));
    }

    @PutMapping("/admins/{email}")
    public ResponseEntity<Admin> updateAdmin(@PathVariable String email, @RequestBody UpdateAdminRequest request) {
        return ResponseEntity.ok(adminService.updateAdminByEmail(email, request));
    }

    // Alternative endpoint using query param to avoid path variable conflicts
    @PutMapping("/admins/by-email")
    public ResponseEntity<Admin> updateAdminByEmailParam(@RequestParam("email") String email,
            @RequestBody UpdateAdminRequest request) {
        return ResponseEntity.ok(adminService.updateAdminByEmail(email, request));
    }

    // --- DELETE ---

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<String> deleteTeacher(@PathVariable Long id) {
        adminService.deleteTeacher(id);
        return ResponseEntity.ok("Teacher deleted successfully");
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {
        adminService.deleteStudent(id);
        return ResponseEntity.ok("Student deleted successfully");
    }
}