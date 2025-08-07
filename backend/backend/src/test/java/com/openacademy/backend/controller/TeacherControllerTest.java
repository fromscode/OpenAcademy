package com.openacademy.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openacademy.backend.dto.LoginRequest;
import com.openacademy.backend.dto.LoginResponse;
import com.openacademy.backend.dto.TeacherRegisterRequest;
import com.openacademy.backend.entity.common.Role;
import com.openacademy.backend.service.LoginService;
import com.openacademy.backend.service.TeacherRegisterService;

@WebMvcTest(TeacherController.class)
public class TeacherControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TeacherRegisterService service;

    @MockitoBean
    private LoginService loginService;

    private TeacherRegisterRequest request;
    private LoginRequest loginRequest;

    @BeforeEach
    public void initialize() {
        request = new TeacherRegisterRequest();
        request.setEmail("test@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEducation("PHD");
        request.setPassword("babababa");
        request.setRole(Role.TEACHER);
        request.setPassword("babababa");
        request.setPhoneNumber("101010101010");


        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("ababababa");
    }

    @Test
    public void registerTeacherPassesForValidRequest() throws Exception {
        when(service.registerTeacher(any())).thenReturn("test string");

        mockMvc.perform(post("/api/auth/teacher/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(content().string("test string"));
    }

    @Test
    public void failsForIncompleteRequest() throws Exception {
        request.setEmail(null);

        mockMvc.perform(post("/api/auth/teacher/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));
    }

    @Test
    public void failsForDupliateRequest() throws Exception {
        when(service.registerTeacher(any())).thenThrow(
            new IllegalArgumentException("test-string")
        );

        mockMvc.perform(post("/api/auth/teacher/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isConflict())
        .andExpect(content().string("test-string"));
    }

    @Test
    public void validCredentialsPassLogin() throws Exception {
        LoginResponse response = new LoginResponse();
        response.setEmail("test@example.com");
        response.setFirstName("John");
        response.setRole(Role.TEACHER);
        response.setMessage("Login succesfull");

        when(loginService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/teacher/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(loginRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("test@example.com"))
        .andExpect(jsonPath("$.firstName").value("John"))
        .andExpect(jsonPath("$.role").value("TEACHER"))
        .andExpect(jsonPath("$.message").value("Login succesfull"));
    }

    @Test
    public void incompleteCredentialsFailLogin() throws Exception {
        loginRequest.setEmail(null);

        mockMvc.perform(post("/api/auth/teacher/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(loginRequest)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Incomplete Request"));

    }

    @Test
    public void invalidCredentialsFailLogin() throws Exception {
        LoginResponse response = new LoginResponse();
        response.setMessage("Invalid email or password");

        when(loginService.login(any())).thenThrow(
            new IllegalArgumentException("Invalid email or password")
        );

        mockMvc.perform(post("/api/auth/teacher/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(loginRequest)))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
}
