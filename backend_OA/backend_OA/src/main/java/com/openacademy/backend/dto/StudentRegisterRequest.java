package com.openacademy.backend.dto;

import java.time.LocalDate;

import com.openacademy.backend.entities.common.Role;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRegisterRequest extends UserRegisterRequest{
    private LocalDate dateOfBirth;

    @Override
    public boolean isValid() {
        return super.isValid() && super.getRole().equals(Role.STUDENT)
        && dateOfBirth != null;
    }
}
