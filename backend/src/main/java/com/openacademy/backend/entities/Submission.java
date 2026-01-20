package com.openacademy.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions", uniqueConstraints = {
    // Ensures a student can only submit once per assignment
    // (unless you delete the old one or handle versions differently)
    @UniqueConstraint(columnNames = { "assignment_id", "student_id" })
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Submission {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // RELATIONSHIPS ------------------------------------------------

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assignment_id", nullable = false)
  private Assignment assignment;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "student_id", nullable = false)
  private User student;

  // SUBMISSION CONTENT -------------------------------------------

  // If the submission is a file upload (store the URL/Path to S3/Local storage)
  @Column(name = "file_url")
  private String fileUrl;

  // GRADING ------------------------------------------------------

  // The score given by the instructor (e.g., 85)
  // Using Double to allow for half-points (85.5)
  @Column(name = "grade")
  private Double grade;

  // Instructor's written feedback
  @Column(columnDefinition = "TEXT")
  private String feedback;

  // TIMESTAMPS ---------------------------------------------------

  @CreationTimestamp
  @Column(name = "submitted_at", updatable = false)
  private LocalDateTime submittedAt;

  @UpdateTimestamp
  @Column(name = "graded_at")
  private LocalDateTime gradedAt;

  // HELPER METHODS -----------------------------------------------

  public boolean isGraded() {
    return this.grade != null;
  }
}
