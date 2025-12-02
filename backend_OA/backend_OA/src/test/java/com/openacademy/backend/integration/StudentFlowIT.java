package com.openacademy.backend.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openacademy.backend.dto.StudentRegisterRequest;
import com.openacademy.backend.entities.Student;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;
import com.openacademy.backend.repository.StudentRepository;
import com.openacademy.backend.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class StudentFlowIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepo;
    
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ObjectMapper mapper;
    
    private StudentRegisterRequest request;

    @BeforeEach
    public void initialize() {
        request = new StudentRegisterRequest();
        request.setEmail("test@examplesdfs.com");
        request.setFirstName("John");
        request.setMiddleName("Betty");
        request.setLastName("Doe");
        request.setDateOfBirth(LocalDate.of(2022, 12, 18));
        request.setPassword("babababa");
        request.setPhoneNumber("123456789");
        request.setRole(Role.STUDENT);
    }

    @Test
    public void correctDetailsSucceedsRegistration() throws Exception {
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(content().string("Student registered successfully!"));

        Optional<User> optionalUser = userRepo.findByEmail(request.getEmail());
        assertTrue(optionalUser.isPresent());
        User user = optionalUser.get();

        Optional<Student> optionalStudent = studentRepo.findById(user.getId());
        assertTrue(optionalStudent.isPresent());
        Student student = optionalStudent.get();
        student.setUser(user);

        assertEquals(request.getEmail(), user.getEmail());
        assertEquals(request.getFirstName(), user.getFirstName());
        assertEquals(request.getMiddleName(), user.getMiddleName());
        assertEquals(request.getLastName(), user.getLastName());
        assertEquals(request.getPassword(), user.getPassword());
        assertEquals(request.getRole(), user.getRole());
        assertEquals(request.getPhoneNumber(), user.getPhoneNumber());
        assertEquals(request.getDateOfBirth(), student.getDateOfBirth());
    }

    @Test
    public void invalidEmailFailsRegistration() throws Exception {
        request.setEmail("");
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

        request.setEmail(null);
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

    }

    @Test
    public void invalidPasswordFailsRegistration() throws Exception {
        request.setPassword("");
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

        request.setPassword(null);
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

    }

    @Test
    public void invalidRoleFailsRegistration() throws Exception {
        request.setRole(Role.ADMIN);
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

        request.setRole(Role.TEACHER);
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

        request.setRole(null);
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

    }

    @Test
    public void invalidFirstNameFailsRegistration() throws Exception {
        request.setFirstName("");
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

        request.setFirstName(null);
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

    }

    @Test
    public void invalidLastNameFailsRegistration() throws Exception {
        request.setLastName("");
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

        request.setLastName(null);
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

    }

    @Test
    public void invalidPhoneNumberFailsRegistration() throws Exception {
        request.setPhoneNumber("");
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

        request.setPhoneNumber(null);
        mockMvc.perform(post("/api/auth/student/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("Invalid Request"));

    }
}
