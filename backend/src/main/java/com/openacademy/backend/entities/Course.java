package com.openacademy.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.openacademy.backend.entities.common.CourseStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Course {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "course_code", nullable = false, unique = true)
  private String courseCode;

  @Column(name = "max_students")
  private Integer maxStudents;

  @Column(name = "start_date")
  private LocalDate startDate;

  @Column(name = "end_date")
  private LocalDate endDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private CourseStatus status = CourseStatus.DRAFT;

  // RELATIONSHIPS ------------------------------------------------

  // 1. Instructor (Unchanged)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "instructor_id", nullable = false)
  private User instructor;

  // 2. Enrollments (UPDATED)
  // Replaces the old Set<User> students.
  // We use OneToMany because One Course has Many Enrollments.
  @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonIgnore
  private List<Enrollment> enrollments = new ArrayList<>();

  // 3. Assignments (ADDED)
  // One Course has Many Assignments.
  @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonIgnore
  private List<Assignment> assignments = new ArrayList<>();

  // TIMESTAMPS ---------------------------------------------------

  @CreationTimestamp
  @Column(updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  // HELPER METHODS -----------------------------------------------

  // Helper to add an assignment and ensure the bi-directional link is set
  public void addAssignment(Assignment assignment) {
    assignments.add(assignment);
    assignment.setCourse(this);
  }

  public void removeAssignment(Assignment assignment) {
    assignments.remove(assignment);
    assignment.setCourse(null);
  }
}