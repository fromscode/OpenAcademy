package com.openacademy.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.openacademy.backend.dto.StudentRegisterRequest;
import com.openacademy.backend.entity.Student;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.repository.StudentRepository;

public class StudentRegisterServiceTest {
    @InjectMocks
    StudentRegisterService service;

    @Mock UserRegisterService userService;

    @Mock
    StudentRepository repo;

    private StudentRegisterRequest request;

    @BeforeEach
    public void initialize() {
        MockitoAnnotations.openMocks(this);
        request = new StudentRegisterRequest();
        request.setEmail("test@example.com");
        request.setDateOfBirth(LocalDate.of(2022, 12, 18));
        request.setFirstName("John");
        request.setLastName(("Doe"));
        request.setPassword("abababa");
        request.setPassword("1234567896");
    }

    @Test
    public void validStudentRegisteredSuccessfully() {
        User user = new User();
        user.setEmail(request.getEmail());

        when(userService.registerUser(any(StudentRegisterRequest.class))).thenReturn(user);

        String result = service.registerStudent(request);
        ArgumentCaptor<Student> studentCaptor = ArgumentCaptor.forClass(Student.class);

        verify(repo).save(studentCaptor.capture());
        Student savedStudent = studentCaptor.getValue();

        assertEquals(user.getEmail(), savedStudent.getUser().getEmail());
        assertEquals("Student registered successfully!", result);
    }

    @Test
    public void duplicateStudentThrowsException() {
        User user = new User();
        user.setEmail((request.getEmail()));

        when(userService.registerUser(any())).thenThrow(
            new IllegalArgumentException("Email already in use!")
        );

        Exception e = assertThrows(IllegalArgumentException.class, () -> service.registerStudent(request));
        assertEquals("Email already in use!", e.getMessage());
    }
}
