package com.openacademy.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.openacademy.backend.dto.StudentRegisterRequest;
import com.openacademy.backend.entity.Student;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.repository.StudentRepository;

@Service
public class StudentRegisterService {
    @Autowired
    private UserRegisterService userService;

    @Autowired
    private StudentRepository studentRepo;

    public String registerStudent(StudentRegisterRequest request) {
       User user = userService.registerUser(request);
        
        Student student = new Student();
        student.setUser(user);
        studentRepo.save(student);
        return "Student registered successfully!";
    }

}
