package com.openacademy.backend.service;

import com.openacademy.backend.dto.LoginRequest; // Import your existing DTOs
import com.openacademy.backend.dto.LoginResponse;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.UserRepository;
import com.openacademy.backend.security.CustomUserDetails;
import com.openacademy.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // Lombok handles the constructor injection
public class LoginService {

    private final UserRepository repo;
    private final JwtService jwtService; // <--- The Key Generator we built
    private final AuthenticationManager authenticationManager; // <--- The Security Manager

    public LoginResponse login(LoginRequest request) {
        LoginResponse response = new LoginResponse();

        try {
            // 1. Authenticate via Spring Security
            // This verifies the email exists AND hashes the password to check against the
            // DB.
            // If it fails, it throws a BadCredentialsException immediately.
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            // 2. If we get here, the user is valid. Fetch them to build the response.
            User user = repo.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // 3. Generate the real JWT Token
            String jwtToken = jwtService.generateToken(new CustomUserDetails(user));

            // 4. Build your existing complex Response object
            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
            userInfo.setId(user.getId());
            userInfo.setEmail(user.getEmail());
            userInfo.setFirstName(user.getFirstName());
            userInfo.setMiddleName(user.getMiddleName());
            userInfo.setLastName(user.getLastName());
            userInfo.setRoleFromEnum(user.getRole());

            response.setSuccess(true);
            response.setRole(user.getRole());
            response.setFirstName(user.getFirstName());
            response.setEmail(user.getEmail());
            response.setUser(userInfo);
            response.setMessage("Login Successful");
            response.setToken(jwtToken); // <--- Real Token injected here!

        } catch (Exception e) {
            // If auth fails (bad password, etc.), return the failure response
            response.setSuccess(false);
            response.setMessage("Invalid email or password");
            response.setToken(null);
        }

        return response;
    }
}