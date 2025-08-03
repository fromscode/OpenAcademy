package com.openacademy.backend.service;

import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.LoginRequest;
import com.openacademy.backend.dto.LoginResponse;
import com.openacademy.backend.dto.StudentRegisterRequest;
import com.openacademy.backend.dto.TeacherRegisterRequest;

@Service
public interface AuthService {
    String registerStudent(StudentRegisterRequest request);
    String registerTeacher(TeacherRegisterRequest request);
    LoginResponse login(LoginRequest request);
}
