package com.openacademy.backend.dto;

import lombok.Data;

@Data
public class CreateAdminRequest {
  // User Fields
  private String firstName;
  private String middleName;
  private String lastName;
  private String email;
  private String password;
  private String phoneNumber;
}