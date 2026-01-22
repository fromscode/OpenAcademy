package com.openacademy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.openacademy.backend.dto.CourseDTO;
import com.openacademy.backend.dto.CreateCourseRequest;
import com.openacademy.backend.dto.EnrollRequest;
import com.openacademy.backend.entities.Course;
import com.openacademy.backend.entities.Enrollment;
import com.openacademy.backend.service.CourseService;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

  private final CourseService courseService;

  // POST /api/courses
  // Create a new course
  @PostMapping
  public ResponseEntity<Course> createCourse(@RequestBody CreateCourseRequest request) {
    Course newCourse = courseService.createCourse(request);
    return ResponseEntity.ok(newCourse);
  }

  // GET /api/courses
  // Get all available courses
  @GetMapping
  public ResponseEntity<List<CourseDTO>> getAllCourses() {
    return ResponseEntity.ok(courseService.getAllCoursesDTO());
  }

  // GET /api/courses/instructor/{instructorId}
  // Get courses created by a specific instructor (teacher)
  @GetMapping("/instructor/{instructorId}")
  public ResponseEntity<List<Course>> getInstructorCourses(@PathVariable Long instructorId) {
    return ResponseEntity.ok(courseService.getCoursesByInstructor(instructorId));
  }

  // GET /api/courses/student/{studentId}
  // Get courses the given student is enrolled in
  @GetMapping("/student/{studentId}")
  public ResponseEntity<List<Course>> getStudentCourses(@PathVariable Long studentId) {
    return ResponseEntity.ok(courseService.getCoursesForStudent(studentId));
  }

  // POST /api/courses/{courseId}/enroll
  // Enroll a student in a course
  @PostMapping("/{courseId}/enroll")
  public ResponseEntity<Enrollment> enrollStudent(
      @PathVariable Long courseId,
      @RequestBody EnrollRequest request) {

    Enrollment enrollment = courseService.enrollStudent(courseId, request.getStudentId());
    return ResponseEntity.ok(enrollment);
  }
}
