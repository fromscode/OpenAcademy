package com.openacademy.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.CreateCourseRequest;
import com.openacademy.backend.entities.Course;
import com.openacademy.backend.entities.Enrollment;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.CourseStatus;
import com.openacademy.backend.repository.CourseRepository;
import com.openacademy.backend.repository.EnrollmentRepository;
import com.openacademy.backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

  private final CourseRepository courseRepository;
  private final EnrollmentRepository enrollmentRepository;
  private final UserRepository userRepository; // Assuming you have this from step 1

  public Course createCourse(CreateCourseRequest request) {
    User instructor = userRepository.findById(request.getInstructorId())
        .orElseThrow(() -> new RuntimeException("Instructor not found"));

    // Optional: Check if user has ROLE_INSTRUCTOR here

    Course course = new Course();
    course.setTitle(request.getTitle());
    course.setDescription(request.getDescription());
    course.setCourseCode(request.getCourseCode());
    course.setStartDate(request.getStartDate());
    course.setEndDate(request.getEndDate());
    course.setInstructor(instructor);
    course.setStatus(CourseStatus.PUBLISHED); // Default to Published for now

    return courseRepository.save(course);
  }

  public List<Course> getAllCourses() {
    return courseRepository.findAll();
  }

  @Transactional
  public Enrollment enrollStudent(Long courseId, Long studentId) {
    // 1. Check if already enrolled
    if (enrollmentRepository.existsByCourseIdAndStudentId(courseId, studentId)) {
      throw new RuntimeException("Student is already enrolled in this course");
    }

    // 2. Fetch entities
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new RuntimeException("Course not found"));

    User student = userRepository.findById(studentId)
        .orElseThrow(() -> new RuntimeException("Student not found"));

    // 3. Create Enrollment
    Enrollment enrollment = new Enrollment();
    enrollment.setCourse(course);
    enrollment.setStudent(student);

    return enrollmentRepository.save(enrollment);
  }
}
