package com.openacademy.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateCourseRequest {
  private String title;
  private String description;
  private String courseCode;
  private Long instructorId; // The ID of the user creating the course
  private LocalDate startDate;
  private LocalDate endDate;
}