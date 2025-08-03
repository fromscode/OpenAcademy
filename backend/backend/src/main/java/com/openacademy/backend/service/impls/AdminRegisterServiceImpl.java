package com.openacademy.backend.service.impls;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import com.openacademy.backend.dto.AdminRegisterRequest;
import com.openacademy.backend.entity.Admin;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.repository.AdminRepository;
import com.openacademy.backend.repository.UserRepository;
import com.openacademy.backend.service.AdminRegisterService;

public class AdminRegisterServiceImpl implements AdminRegisterService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AdminRepository adminRepo;

    @Override
    public String registerAdmin(AdminRegisterRequest request) {
        Optional<User> optionalUser = userRepo.findByEmail(request.getEmail());
        if (optionalUser.isPresent()) return "Email already in use!";

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setMiddleName(request.getMiddleName());
        user.setPassword(request.getPassword());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());

        Admin admin = new Admin();
        admin.setUser(user);
        userRepo.save(user);
        adminRepo.save(admin);
        return "Admin registered successfully!";
    }

}
