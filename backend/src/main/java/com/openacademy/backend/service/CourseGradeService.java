package com.openacademy.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.openacademy.backend.entities.Assignment;
import com.openacademy.backend.entities.Enrollment;
import com.openacademy.backend.entities.Submission;
import com.openacademy.backend.repository.AssignmentRepository;
import com.openacademy.backend.repository.EnrollmentRepository;
import com.openacademy.backend.repository.SubmissionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CourseGradeService {

  private final SubmissionRepository submissionRepository;
  private final EnrollmentRepository enrollmentRepository;
  private final AssignmentRepository assignmentRepository;

  /**
   * MAIN METHOD: Called when an instructor grades a submission.
   * 1. Saves the grade for the specific assignment.
   * 2. Triggers a recalculation of the total course grade.
   */
  @Transactional
  public Submission gradeSubmission(Long submissionId, Double grade, String feedback) {
    // 1. Fetch the submission
    Submission submission = submissionRepository.findById(submissionId)
        .orElseThrow(() -> new RuntimeException("Submission not found"));

    // 2. Validate the grade (don't allow 110/100 unless you want extra credit
    // logic)
    if (grade < 0 || grade > submission.getAssignment().getMaxScore()) {
      throw new IllegalArgumentException(
          "Grade cannot exceed max score of " + submission.getAssignment().getMaxScore());
    }

    // 3. Update the specific submission
    submission.setGrade(grade);
    submission.setFeedback(feedback);
    Submission savedSubmission = submissionRepository.save(submission);

    // 4. Recalculate the overall course grade for this student
    updateStudentCourseGrade(submission.getStudent().getId(), submission.getAssignment().getCourse().getId());

    return savedSubmission;
  }

  /**
   * HELPER METHOD: Recalculates the weighted average for a student in a specific
   * course.
   * Formula: (Total Points Earned / Total Points Possible) * 100
   */
  private void updateStudentCourseGrade(Long studentId, Long courseId) {
    // 1. Get all assignments for this course to know the TOTAL possible score
    List<Assignment> courseAssignments = assignmentRepository.findByCourseId(courseId);

    // 2. Get all graded submissions for this student in this course
    List<Submission> studentSubmissions = submissionRepository.findByStudentIdAndCourseId(studentId, courseId);

    double totalPointsEarned = 0.0;
    double totalPointsPossible = 0.0;

    for (Assignment assignment : courseAssignments) {
      // Find the matching submission for this assignment (if it exists)
      Submission matchingSubmission = studentSubmissions.stream()
          .filter(s -> s.getAssignment().getId().equals(assignment.getId()))
          .findFirst()
          .orElse(null);

      // Only count assignments that have actually been graded.
      // (Optional: You could count missing assignments as 0 if the due date passed)
      if (matchingSubmission != null && matchingSubmission.getGrade() != null) {
        totalPointsEarned += matchingSubmission.getGrade();
        totalPointsPossible += assignment.getMaxScore();
      }
    }

    // 3. Calculate Average (avoid divide by zero)
    Double currentAverage = 0.0;
    if (totalPointsPossible > 0) {
      currentAverage = (totalPointsEarned / totalPointsPossible) * 100;
    }

    // 4. Update the Enrollment record
    Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId)
        .orElseThrow(() -> new RuntimeException("Enrollment not found for student " + studentId));

    enrollment.setCurrentGrade(currentAverage);
    enrollmentRepository.save(enrollment);
  }
}