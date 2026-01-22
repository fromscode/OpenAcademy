package com.openacademy.backend.dto;

import com.openacademy.backend.entities.common.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
  private Long id;
  private String title;
  private String description;
  private String courseCode;
  private Integer maxStudents;
  private LocalDate startDate;
  private LocalDate endDate;
  private CourseStatus status;
  
  // Instructor details
  private Long instructorId;
  private String instructorName;
  private String instructorEmail;
  
  // Timestamps
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  
  // Additional metadata
  private Integer enrolledStudentsCount;
}
