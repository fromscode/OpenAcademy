package com.openacademy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.openacademy.backend.entities.Submission;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

  // Find a specific student's submission for a specific assignment
  // (Used when a student clicks "Edit Submission" or views their grade)
  Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

  // Find all submissions for a specific assignment (for the instructor to grade)
  List<Submission> findByAssignmentId(Long assignmentId);

  // Find all submissions for a specific student across a course
  // (Useful for a "My Grades" report card view)
  @Query("SELECT s FROM Submission s WHERE s.student.id = :studentId AND s.assignment.course.id = :courseId")
  List<Submission> findByStudentIdAndCourseId(Long studentId, Long courseId);

  // Find pending grading: Submissions that have been turned in but have no grade
  // yet
  @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.grade IS NULL")
  List<Submission> findUngradedByAssignmentId(Long assignmentId);
}