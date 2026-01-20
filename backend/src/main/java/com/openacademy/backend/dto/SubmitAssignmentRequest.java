package com.openacademy.backend.dto;

import lombok.Data;

@Data
public class SubmitAssignmentRequest {
  private Long studentId; // In a real app, you get this from the JWT Token/Session
  private String content; // Text answer
  private String fileUrl; // URL to the uploaded file (e.g., S3 link)
}
