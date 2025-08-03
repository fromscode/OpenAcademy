package com.openacademy.backend.service.impls;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.AdminRegisterRequest;
import com.openacademy.backend.entity.Admin;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.repository.AdminRepository;
import com.openacademy.backend.service.AdminRegisterService;
import com.openacademy.backend.service.UserRegisterService;

@Service
public class AdminRegisterServiceImpl implements AdminRegisterService {

    @Autowired
    private UserRegisterService userService;

    @Autowired
    private AdminRepository adminRepo;

    @Override
    public String registerAdmin(AdminRegisterRequest request) {
        User user = userService.registerUser(request);
        
        Admin admin = new Admin();
        admin.setUser(user);
        adminRepo.save(admin);
        return "Admin registered successfully!";
    }

}
