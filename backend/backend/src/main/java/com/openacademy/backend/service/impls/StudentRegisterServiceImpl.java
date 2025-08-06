package com.openacademy.backend.service.impls;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.StudentRegisterRequest;
import com.openacademy.backend.entity.Student;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.repository.StudentRepository;
import com.openacademy.backend.service.StudentRegisterService;
import com.openacademy.backend.service.UserRegisterService;

@Service
public class StudentRegisterServiceImpl implements StudentRegisterService {

    @Autowired
    private UserRegisterService userService;

    @Autowired
    private StudentRepository studentRepo;

    @Override
    public String registerStudent(StudentRegisterRequest request) {
       User user = userService.registerUser(request);
        
        Student student = new Student();
        student.setUser(user);
        studentRepo.save(student);
        return "Student registered successfully!";
    }

}
