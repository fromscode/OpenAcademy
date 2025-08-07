package com.openacademy.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.AdminRegisterRequest;
import com.openacademy.backend.entities.Admin;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.AdminRepository;

@Service
public class AdminRegisterService {
    @Autowired
    private UserRegisterService userService;

    @Autowired
    private AdminRepository adminRepo;

    public String registerAdmin(AdminRegisterRequest request) {
        User user = userService.registerUser(request);

        Admin admin = new Admin();
        admin.setUser(user);
        adminRepo.save(admin);
        return "Admin registered successfully!";
    }
}
