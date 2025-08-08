package com.openacademy.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.openacademy.backend.dto.LoginRequest;
import com.openacademy.backend.dto.LoginResponse;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;
import com.openacademy.backend.repository.UserRepository;

public class LoginServiceTest {
    @InjectMocks
    private LoginService service;

    @Mock private UserRepository repo;

    private LoginRequest request;

    @BeforeEach
    public void initialize() {
        MockitoAnnotations.openMocks(this);
        request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("abcabc");
    }

    @Test
    public void invalidEmailOrPasswordFailsLogin() {
        when(repo.findByEmailAndPassword(anyString(), anyString())).thenThrow(
            new IllegalArgumentException("test-string")
        );
        Exception ex = assertThrows(IllegalArgumentException.class, () -> service.login(request));
        assertEquals("test-string", ex.getMessage());
    }

    @Test
    public void validEmailAndPasswordPassesLogin() {
        User user = new User();
        user.setRole(Role.STUDENT);
        user.setFirstName("test");
        user.setEmail("test@example.com");

        when(repo.findByEmailAndPassword(anyString(), anyString()))
            .thenReturn(Optional.of(user));

        LoginResponse response = service.login(request);
        assertEquals(user.getRole(), response.getRole());
        assertEquals(user.getFirstName(), response.getFirstName());
        assertEquals(user.getEmail(), response.getEmail());
        assertEquals("Login Successfull", response.getMessage());
    }
}
