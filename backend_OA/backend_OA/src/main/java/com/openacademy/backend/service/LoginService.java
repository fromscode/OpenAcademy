package com.openacademy.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.LoginRequest;
import com.openacademy.backend.dto.LoginResponse;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.UserRepository;

@Service
public class LoginService {
    @Autowired
    private UserRepository repo;

    public LoginResponse login(LoginRequest request) {
        Optional<User> optionalUser = repo.findByEmailAndPassword
                                (request.getEmail(), request.getPassword());

        LoginResponse response = new LoginResponse();

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = optionalUser.get();
        
        // Create user info object
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setEmail(user.getEmail());
        userInfo.setFirstName(user.getFirstName());
        userInfo.setRole(user.getRole());
        
        // Set response fields
        response.setSuccess(true);
        response.setRole(user.getRole());
        response.setFirstName(user.getFirstName());
        response.setEmail(user.getEmail());
        response.setUser(userInfo);
        response.setMessage("Login Successful");
        response.setToken("temporary-token"); // TODO: Implement proper JWT token generation
        
        return response;
    }
}
