package com.openacademy.backend.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeacherRegisterRequest extends UserRegisterRequest{
    private String education;
}
