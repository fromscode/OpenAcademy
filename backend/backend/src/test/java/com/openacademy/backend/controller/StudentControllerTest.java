package com.openacademy.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

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



import com.fasterxml.jackson.databind.ObjectMapper;
import com.openacademy.backend.dto.StudentRegisterRequest;
import com.openacademy.backend.entity.common.Role;
import com.openacademy.backend.service.impls.StudentRegisterServiceImpl;

@WebMvcTest(StudentController.class)
public class StudentControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private StudentRegisterServiceImpl service;

    private StudentRegisterRequest request;

    @BeforeEach
    public void initialize() {
         request = new StudentRegisterRequest();
        request.setEmail("test@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setDateOfBirth(LocalDate.of(2022, 12, 18));
        request.setPassword("babababa");
        request.setRole(Role.STUDENT);
        request.setPassword("babababa");
        request.setPhoneNumber("101010101010");
    }

    @Test
    public void registerStudentPassesForValidRequest() throws Exception {
        when(service.registerStudent(any())).thenReturn("test string");

        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(content().string("test string"));
    }

    @Test
    public void failsForIncompleteRequest() throws Exception {
        request.setEmail(null);

        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Incomplete Request"));
    }

    @Test
    public void failsForDupliateRequest() throws Exception {
        when(service.registerStudent(any())).thenThrow(
            new IllegalArgumentException("test-string")
        );

        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isConflict())
        .andExpect(content().string("test-string"));
    }
}
