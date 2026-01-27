package com.openacademy.backend.dto;

import lombok.Data;

@Data
public class UpdateTeacherRequest {
  private String firstName;
  private String lastName;
  private String phoneNumber; // Email/Password usually handled separately for security
  private String education;
}