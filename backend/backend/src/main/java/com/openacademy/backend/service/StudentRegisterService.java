package com.openacademy.backend.service;

import org.springframework.stereotype.Service;
import com.openacademy.backend.dto.StudentRegisterRequest;

@Service
public interface StudentRegisterService {
    String registerStudent(StudentRegisterRequest request);
}
