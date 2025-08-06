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

import com.openacademy.backend.dto.AdminRegisterRequest;
import com.openacademy.backend.entity.Admin;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.entity.common.Role;
import com.openacademy.backend.repository.AdminRepository;
import com.openacademy.backend.service.impls.AdminRegisterServiceImpl;

public class AdminRegisterServiceTest {

    @InjectMocks
    private AdminRegisterServiceImpl adminService;

    @Mock
    private UserRegisterService userService;

    @Mock
    private AdminRepository adminRepo;

    private AdminRegisterRequest request;

    @BeforeEach
    public void initializeRequest() {
        MockitoAnnotations.openMocks(this);
        request = new AdminRegisterRequest();
        request.setEmail("test@example.com");
        request.setFirstName("John");
        request.setLastName("Betty");
        request.setPassword("bababa");
        request.setPhoneNumber("1010101010");
        request.setRole(Role.ADMIN);
    }

    @Test
    public void validAdminRegisteredSuccessfully() {
        User user = new User();
        user.setEmail(request.getEmail());

        when(userService.registerUser(any(AdminRegisterRequest.class)))
        .thenReturn(user);

        String result = adminService.registerAdmin(request);

        ArgumentCaptor<Admin> adminCaptor = ArgumentCaptor.forClass(Admin.class);
        verify(adminRepo).save(adminCaptor.capture());
        Admin savedAdmin = adminCaptor.getValue();

        assertEquals(user.getEmail(), savedAdmin.getUser().getEmail());
        assertEquals("Admin registered successfully!", result);
    }

    @Test
    public void duplicateAdminThrowsException() {
        when(userService.registerUser(any(AdminRegisterRequest.class)))
        .thenThrow(new IllegalArgumentException("Email already in use!"));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> 
        adminService.registerAdmin(request));

        assertEquals("Email already in use!", ex.getMessage());
    }
}
