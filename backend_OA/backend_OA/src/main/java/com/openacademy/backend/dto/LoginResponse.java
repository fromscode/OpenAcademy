package com.openacademy.backend.dto;

import com.openacademy.backend.entities.common.Role;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String message;
    private boolean success;
    private Role role;
    private String email;
    private String firstName;
    private String token;
    private UserInfo user;

    @Getter
    @Setter
    public static class UserInfo {
        private String email;
        private String firstName;
        private Role role;
    }
}
