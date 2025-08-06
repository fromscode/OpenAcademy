package com.openacademy.backend.service.impls;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.LoginRequest;
import com.openacademy.backend.dto.LoginResponse;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.repository.UserRepository;
import com.openacademy.backend.service.LoginService;

@Service
public class LoginServiceImpl implements LoginService{

    @Autowired
    private UserRepository repo;

    @Override
    public LoginResponse login(LoginRequest request) {
        Optional<User> optionalUser = repo.findByEmailAndPassword
                                (request.getEmail(), request.getPassword());

        LoginResponse response = new LoginResponse();

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = optionalUser.get();
                                    
        response.setRole(user.getRole());
        response.setFirstName(user.getFirstName());
        response.setEmail(user.getEmail());
        response.setMessage("Login Successfull");
        return response;
    }

}
