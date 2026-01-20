package com.openacademy.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Assignment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  // The deadline for the assignment
  @Column(name = "due_date", nullable = false)
  private LocalDateTime dueDate;

  // Maximum points achievable (e.g., 100, 10, or 5.0)
  @Column(name = "max_score", nullable = false)
  private Integer maxScore;

  // RELATIONSHIPS ------------------------------------------------

  // Link to the Course this assignment belongs to
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  // TIMESTAMPS ---------------------------------------------------

  @CreationTimestamp
  @Column(updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  // HELPER METHODS -----------------------------------------------

  // Check if the assignment is currently overdue
  public boolean isOverdue() {
    return LocalDateTime.now().isAfter(dueDate);
  }
}
