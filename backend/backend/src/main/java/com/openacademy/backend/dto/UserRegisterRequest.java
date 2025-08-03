package com.openacademy.backend.dto;

import com.openacademy.backend.entity.common.Role;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class UserRegisterRequest {
    private String email;
    private String password;
    private Role role;
    private String firstName;
    private String middleName;
    private String lastName;
    private String phoneNumber;
}
