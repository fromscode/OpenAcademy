package com.openacademy.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.openacademy.backend.dto.TeacherRegisterRequest;
import com.openacademy.backend.entities.Teacher;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.TeacherRepository;

@Service
public class TeacherRegisterService {
    @Autowired
    private UserRegisterService userService;

    @Autowired
    private TeacherRepository teacherRepo;

    public String registerTeacher(TeacherRegisterRequest request) {
        User user = userService.registerUser(request);
        
        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setEducation(request.getEducation());
        teacherRepo.save(teacher);
        return "Teacher registered successfully!";
    }
}
