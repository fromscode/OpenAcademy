package com.openacademy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.openacademy.backend.entities.Course;
import com.openacademy.backend.entities.common.CourseStatus;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

  // Find all courses created by a specific instructor
  List<Course> findByInstructorId(Long instructorId);

  // Find courses by status (e.g., show me all PUBLISHED courses)
  List<Course> findByStatus(CourseStatus status);

  // Search for courses by title or code (for a search bar)
  // Uses generic wildcard search (e.g., %Math%)
  List<Course> findByTitleContainingIgnoreCaseOrCourseCodeContainingIgnoreCase(String title, String courseCode);

  // Find all courses a specific student is enrolled in
  // This joins the Enrollment table implicitly to filter efficiently
  @Query("SELECT c FROM Course c JOIN c.enrollments e WHERE e.student.id = :studentId")
  List<Course> findCoursesByStudentId(Long studentId);
}
