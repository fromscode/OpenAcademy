package com.openacademy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.CreateAssignmentRequest;
import com.openacademy.backend.entities.Assignment;
import com.openacademy.backend.entities.Course;
import com.openacademy.backend.repository.AssignmentRepository;
import com.openacademy.backend.repository.CourseRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AssignmentService {

  private final AssignmentRepository assignmentRepository;
  private final CourseRepository courseRepository;

  public Assignment createAssignment(Long courseId, CreateAssignmentRequest request) {
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new RuntimeException("Course not found"));

    Assignment assignment = new Assignment();
    assignment.setTitle(request.getTitle());
    assignment.setDescription(request.getDescription());
    assignment.setDueDate(request.getDueDate());
    assignment.setMaxScore(request.getMaxScore());
    assignment.setContent(request.getContent());

    // Use the helper method we wrote in the Course entity earlier
    // to ensure relationships are set correctly
    course.addAssignment(assignment);

    return assignmentRepository.save(assignment);
  }

  public List<Assignment> getAssignmentsByCourse(Long courseId) {
    return assignmentRepository.findByCourseId(courseId);
  }

  public Assignment getAssignmentById(Long assignmentId) {
    return assignmentRepository.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));
  }

  // Optional: Update Assignment (e.g., extend deadline)
  public Assignment updateAssignment(Long assignmentId, CreateAssignmentRequest request) {
    Assignment assignment = assignmentRepository.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));

    assignment.setTitle(request.getTitle());
    assignment.setDescription(request.getDescription());
    assignment.setDueDate(request.getDueDate());
    assignment.setMaxScore(request.getMaxScore());
    assignment.setContent(request.getContent());

    return assignmentRepository.save(assignment);
  }

  // Optional: Delete Assignment
  public void deleteAssignment(Long assignmentId) {
    assignmentRepository.deleteById(assignmentId);
  }
}
