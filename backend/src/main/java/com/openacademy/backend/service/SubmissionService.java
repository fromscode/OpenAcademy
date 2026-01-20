package com.openacademy.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.GradeSubmissionRequest;
import com.openacademy.backend.dto.SubmitAssignmentRequest;
import com.openacademy.backend.entities.Assignment;
import com.openacademy.backend.entities.Submission;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.AssignmentRepository;
import com.openacademy.backend.repository.SubmissionRepository;
import com.openacademy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionService {

  private final SubmissionRepository submissionRepository;
  private final AssignmentRepository assignmentRepository;
  private final UserRepository userRepository;
  private final CourseGradeService courseGradeService; // To trigger grading logic

  @Transactional
  public Submission submitAssignment(Long assignmentId, SubmitAssignmentRequest request) {
    // 1. Fetch Assignment and Student
    Assignment assignment = assignmentRepository.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));

    User student = userRepository.findById(request.getStudentId())
        .orElseThrow(() -> new RuntimeException("Student not found"));

    // 2. Check for existing submission (Update vs Create)
    Optional<Submission> existingSubmission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId,
        request.getStudentId());

    Submission submission;
    if (existingSubmission.isPresent()) {
      submission = existingSubmission.get();
      // Reset grade if student resubmits (optional policy)
      submission.setGrade(null);
      submission.setFeedback(null);
      submission.setGradedAt(null);
    } else {
      submission = new Submission();
      submission.setAssignment(assignment);
      submission.setStudent(student);
    }

    // 3. Update Content
    submission.setContent(request.getContent());
    submission.setFileUrl(request.getFileUrl());

    // 4. Check if Late (just flagging it, not blocking it)
    if (LocalDateTime.now().isAfter(assignment.getDueDate())) {
      // Logic to mark as LATE could go here (e.g., set a boolean flag if you added
      // one)
      // submission.setIsLate(true);
    }

    return submissionRepository.save(submission);
  }

  // Pass-through to the GradeService we created earlier
  public Submission gradeSubmission(Long submissionId, GradeSubmissionRequest request) {
    return courseGradeService.gradeSubmission(submissionId, request.getGrade(), request.getFeedback());
  }

  public List<Submission> getSubmissionsForAssignment(Long assignmentId) {
    return submissionRepository.findByAssignmentId(assignmentId);
  }
}