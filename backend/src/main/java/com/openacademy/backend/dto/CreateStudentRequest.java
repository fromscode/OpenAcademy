package com.openacademy.backend.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class CreateStudentRequest {
  // User Fields
  private String firstName;
  private String middleName;
  private String lastName;
  private String email;
  private String password;
  private String phoneNumber;

  // Student Specific
  private LocalDate dateOfBirth;
}