package com.openacademy.backend.dto;


import com.openacademy.backend.entities.common.Role;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminRegisterRequest extends UserRegisterRequest{
    @Override
    public boolean isValid() {
        return super.isValid() && super.getRole().equals(Role.ADMIN);
    }
}
