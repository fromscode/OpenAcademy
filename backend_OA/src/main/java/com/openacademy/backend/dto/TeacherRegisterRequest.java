package com.openacademy.backend.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeacherRegisterRequest extends UserRegisterRequest{
    private String education;

    @Override
    public boolean isValid() {
        return super.isValid() && education != null 
        && !education.isBlank();
    }
}
