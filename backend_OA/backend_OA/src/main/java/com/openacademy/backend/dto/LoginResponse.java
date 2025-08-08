package com.openacademy.backend.dto;

import com.openacademy.backend.entities.common.Role;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String message;
    private Role role;
    private String email;
    private String firstName;
}
