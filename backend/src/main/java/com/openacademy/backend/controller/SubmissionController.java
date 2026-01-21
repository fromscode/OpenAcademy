package com.openacademy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
  @PostMapping("/assignments/{assignmentId}/submit")
  public ResponseEntity<Submission> submitAssignment(
      @PathVariable Long assignmentId,
      @RequestBody SubmitAssignmentRequest request) {

    Submission submission = submissionService.submitAssignment(assignmentId, request);
    return ResponseEntity.ok(submission);
  }

  // INSTRUCTOR: Grade work
  // POST /api/submissions/{submissionId}/grade
  @PostMapping("/submissions/{submissionId}/grade")
  public ResponseEntity<Submission> gradeSubmission(
      @PathVariable Long submissionId,
      @RequestBody GradeSubmissionRequest request) {

    Submission gradedSubmission = submissionService.gradeSubmission(submissionId, request);
    return ResponseEntity.ok(gradedSubmission);
  }

  // INSTRUCTOR: Get all submissions for an assignment
  // GET /api/assignments/{assignmentId}/submissions
  @GetMapping("/assignments/{assignmentId}/submissions")
  public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long assignmentId) {
    return ResponseEntity.ok(submissionService.getSubmissionsForAssignment(assignmentId));
  }

  // STUDENT: Get my submission for a specific assignment (if any)
  // GET /api/assignments/{assignmentId}/submission-of/{studentId}
  @GetMapping("/assignments/{assignmentId}/submission-of/{studentId}")
  public ResponseEntity<Submission> getStudentSubmission(
      @PathVariable Long assignmentId,
      @PathVariable Long studentId) {
    return submissionService.getStudentSubmissionForAssignment(assignmentId, studentId)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.noContent().build());
  }
}
