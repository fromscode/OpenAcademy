package com.openacademy.backend.dto;

import lombok.Data;

@Data
public class GradeSubmissionRequest {
  private Double grade; // e.g., 85.0
  private String feedback; // "Good job, but check your citations."
}
