package com.openacademy.backend.service.impls;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.TeacherRegisterRequest;
import com.openacademy.backend.entity.Teacher;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.repository.TeacherRepository;
import com.openacademy.backend.service.TeacherRegisterService;
import com.openacademy.backend.service.UserRegisterService;

@Service
public class TeacherRegisterServiceImpl implements TeacherRegisterService {

    @Autowired
    private UserRegisterService userService;

    @Autowired
    private TeacherRepository teacherRepo;

    @Override
    public String registerTeacher(TeacherRegisterRequest request) {
        User user = userService.registerUser(request);
        
        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setEducation(request.getEducation());
        teacherRepo.save(teacher);
        return "Teacher registered successfully!";
    }

}
