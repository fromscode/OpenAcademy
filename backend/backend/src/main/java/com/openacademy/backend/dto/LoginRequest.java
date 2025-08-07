package com.openacademy.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String email;
    private String password;

    public boolean isValid() {
        return email != null && !email.isBlank()
        && password != null && !password.isBlank();
    }
}
