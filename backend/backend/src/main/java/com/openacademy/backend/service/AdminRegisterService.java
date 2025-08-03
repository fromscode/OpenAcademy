package com.openacademy.backend.service;

import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.AdminRegisterRequest;

@Service
public interface AdminRegisterService {
    String registerTeacher(AdminRegisterRequest request);
}
