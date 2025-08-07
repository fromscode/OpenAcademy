package com.openacademy.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.UserRegisterRequest;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.UserRepository;

@Service
public class UserRegisterService {
    @Autowired
    private UserRepository repo;

    public User registerUser(UserRegisterRequest request) {
        Optional<User> optionalUser = repo.findByEmail(request.getEmail());
        if (optionalUser.isPresent()) {
            throw new IllegalArgumentException("Email already in use!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setMiddleName(request.getMiddleName());
        user.setPassword(request.getPassword());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        

        return repo.save(user);
    }
}
