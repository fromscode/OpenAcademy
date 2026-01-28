package com.openacademy.backend.dto;

import lombok.Data;

@Data
public class UpdateAdminRequest {
  private String firstName;
  private String middleName;
  private String lastName;
  private String phoneNumber;
  // Optional: update email and password
  private String email; // new email to set
  private String password; // new password to set (encrypt in real app)
}
