package com.openacademy.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.openacademy.backend.entities.common.EnrollmentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "course_id", "student_id" })
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Enrollment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // RELATIONSHIPS ------------------------------------------------

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "student_id", nullable = false)
  private User student;

  // STATUS & GRADES ----------------------------------------------

  // Caches the calculated average of all assignments (e.g., 88.5)
  // Updated via business logic whenever a Submission is graded
  @Column(name = "current_grade")
  private Double currentGrade;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

  // TIMESTAMPS ---------------------------------------------------

  @CreationTimestamp
  @Column(name = "enrolled_at", updatable = false)
  private LocalDateTime enrolledAt;

  @Column(name = "completed_at")
  private LocalDateTime completedAt;

  // HELPER METHODS -----------------------------------------------

  public void completeCourse(Double finalGrade) {
    this.status = EnrollmentStatus.COMPLETED;
    this.currentGrade = finalGrade;
    this.completedAt = LocalDateTime.now();
  }
}