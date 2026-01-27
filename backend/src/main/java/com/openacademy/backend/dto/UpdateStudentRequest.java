package com.openacademy.backend.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class UpdateStudentRequest {
  private String firstName;
  private String lastName;
  private String phoneNumber;
  private LocalDate dateOfBirth;
}