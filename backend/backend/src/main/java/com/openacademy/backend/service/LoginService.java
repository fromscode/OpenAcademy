package com.openacademy.backend.service;

import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.LoginRequest;
import com.openacademy.backend.dto.LoginResponse;

@Service
public interface LoginService {
    LoginResponse login(LoginRequest request);
}
