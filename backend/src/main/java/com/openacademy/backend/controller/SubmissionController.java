package com.openacademy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.openacademy.backend.dto.GradeSubmissionRequest;
import com.openacademy.backend.dto.SubmitAssignmentRequest;
import com.openacademy.backend.entities.Submission;
import com.openacademy.backend.service.SubmissionService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubmissionController {

  private final SubmissionService submissionService;

  // STUDENT: Submit work
  // POST /api/assignments/{assignmentId}/submit
  @PreAuthorize("hasRole('STUDENT')")
  @PostMapping("/assignments/{assignmentId}/submit")
  public ResponseEntity<Submission> submitAssignment(
      @PathVariable Long assignmentId,
      @RequestBody SubmitAssignmentRequest request) {

    Submission submission = submissionService.submitAssignment(assignmentId, request);
    return ResponseEntity.ok(submission);
  }

  // INSTRUCTOR: Grade work
  // POST /api/submissions/{submissionId}/grade
  @PreAuthorize("hasRole('TEACHER')")
  @PostMapping("/submissions/{submissionId}/grade")
  public ResponseEntity<Submission> gradeSubmission(
      @PathVariable Long submissionId,
      @RequestBody GradeSubmissionRequest request) {

    Submission gradedSubmission = submissionService.gradeSubmission(submissionId, request);
    return ResponseEntity.ok(gradedSubmission);
  }

  // INSTRUCTOR: Get all submissions for an assignment
  // GET /api/assignments/{assignmentId}/submissions
  @PreAuthorize("hasRole('TEACHER')")
  @GetMapping("/assignments/{assignmentId}/submissions")
  public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long assignmentId) {
    return ResponseEntity.ok(submissionService.getSubmissionsForAssignment(assignmentId));
  }

  // STUDENT: Get my submission for a specific assignment (if any)
  // GET /api/assignments/{assignmentId}/submission-of/{studentId}
  @PreAuthorize("(hasRole('STUDENT') and #studentId == authentication.principal.id)")
  @GetMapping("/assignments/{assignmentId}/submission-of/{studentId}")
  public ResponseEntity<Submission> getStudentSubmission(
      @PathVariable Long assignmentId,
      @PathVariable Long studentId) {
    return submissionService.getStudentSubmissionForAssignment(assignmentId, studentId)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.noContent().build());
  }
}
