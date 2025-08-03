package com.openacademy.backend.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRegisterRequest extends BaseRegisterRequest{
    private LocalDate dateOfBirth;
}
