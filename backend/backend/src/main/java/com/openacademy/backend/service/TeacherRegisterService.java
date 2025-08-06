package com.openacademy.backend.service;

import org.springframework.stereotype.Service;
import com.openacademy.backend.dto.TeacherRegisterRequest;

@Service
public interface TeacherRegisterService {
    String registerTeacher(TeacherRegisterRequest request);
}
