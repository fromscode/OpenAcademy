package com.openacademy.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class StudentDashboardDTO {
  private String studentName;
  private List<CourseSummary> activeCourses;
  private List<UpcomingTask> upcomingAssignments;
  private List<RecentGrade> recentGrades;

  @Data
  @Builder
  public static class CourseSummary {
    private Long courseId;
    private String courseTitle;
    private String courseCode;
    private Double currentGrade; // The running average (e.g., 88.5)
  }

  @Data
  @Builder
  public static class UpcomingTask {
    private Long assignmentId;
    private String courseTitle;
    private String assignmentTitle;
    private LocalDateTime dueDate;
    private boolean isOverdue; // simple flag for red text in UI
  }

  @Data
  @Builder
  public static class RecentGrade {
    private String courseTitle;
    private String assignmentTitle;
    private Double grade;
    private String feedback;
  }
}