package com.openacademy.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateAssignmentRequest {
  private String title;
  private String description;
  private LocalDateTime dueDate;
  private Integer maxScore;
}
