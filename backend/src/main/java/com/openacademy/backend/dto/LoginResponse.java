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
        private Long id;
        private String email;
        private String firstName;
        private String middleName;
        private String lastName;
        private String role; // Changed to String for lowercase role

        public void setRoleFromEnum(Role roleEnum) {
            this.role = roleEnum != null ? roleEnum.name().toLowerCase() : null;
        }
    }
}
