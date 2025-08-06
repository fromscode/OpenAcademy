package com.openacademy.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.openacademy.backend.dto.TeacherRegisterRequest;
import com.openacademy.backend.entity.Teacher;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.repository.TeacherRepository;
import com.openacademy.backend.service.impls.TeacherRegisterServiceImpl;

public class TeacherRegisterServiceTest {
    @InjectMocks
    TeacherRegisterServiceImpl service;

    @Mock
    TeacherRepository teacherRepo;

    @Mock
    UserRegisterService userService;

    private TeacherRegisterRequest request;

    @BeforeEach
    public void initialize() {
        MockitoAnnotations.openMocks(this);
        request = new TeacherRegisterRequest();
        request.setEmail("test@example.com");
        request.setFirstName("John");
        request.setLastName(("Doe"));
        request.setPassword("abababa");
        request.setPassword("1234567896");
        request.setEducation("PHD");
    }

    @Test
    public void validTeacherRegisteredSuccessfully() {
        User user = new User();
        user.setEmail(request.getEmail());

        when(userService.registerUser(any())).thenReturn(user);

        String result = service.registerTeacher(request);

        ArgumentCaptor<Teacher> teacherCaptor = ArgumentCaptor.forClass(Teacher.class);
        verify(teacherRepo).save(teacherCaptor.capture());
        Teacher capturedTeacher = teacherCaptor.getValue();

        assertEquals(user.getEmail(), capturedTeacher.getUser().getEmail());
        assertEquals("Teacher registered successfully!", result);
    }

    @Test
    public void duplicateTeacherThrowsException() {
        when(userService.registerUser(request)).thenThrow(
            new IllegalArgumentException("test exception")
        );

        Exception e = assertThrows(IllegalArgumentException.class, () -> service.registerTeacher(request));
        assertEquals("test exception", e.getMessage());
    }
}
