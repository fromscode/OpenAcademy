package com.openacademy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.openacademy.backend.dto.CreateAssignmentRequest;
import com.openacademy.backend.entities.Assignment;
import com.openacademy.backend.service.AssignmentService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AssignmentController {

  private final AssignmentService assignmentService;

  // POST /api/courses/{courseId}/assignments
  // Create a new assignment for a specific course
  @PreAuthorize("hasRole('TEACHER')")
  @PostMapping("/courses/{courseId}/assignments")
  public ResponseEntity<Assignment> createAssignment(
      @PathVariable Long courseId,
      @RequestBody CreateAssignmentRequest request) {

    Assignment newAssignment = assignmentService.createAssignment(courseId, request);
    return ResponseEntity.ok(newAssignment);
  }

  // GET /api/courses/{courseId}/assignments
  // Get the syllabus (list of assignments) for a course
  @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
  @GetMapping("/courses/{courseId}/assignments")
  public ResponseEntity<List<Assignment>> getCourseAssignments(@PathVariable Long courseId) {
    return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId));
  }

  // GET /api/assignments/{id}
  // Get a single assignment by id
  @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
  @GetMapping("/assignments/{id}")
  public ResponseEntity<Assignment> getAssignment(@PathVariable Long id) {
    return ResponseEntity.ok(assignmentService.getAssignmentById(id));
  }

  // PUT /api/assignments/{id}
  // Update details
  @PreAuthorize("hasRole('TEACHER')")
  @PutMapping("/assignments/{id}")
  public ResponseEntity<Assignment> updateAssignment(
      @PathVariable Long id,
      @RequestBody CreateAssignmentRequest request) {
    return ResponseEntity.ok(assignmentService.updateAssignment(id, request));
  }

  // DELETE /api/assignments/{id}
  @DeleteMapping("/assignments/{id}")
  @PreAuthorize("hasRole('TEACHER')")
  public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
    assignmentService.deleteAssignment(id);
    return ResponseEntity.noContent().build();
  }
}
