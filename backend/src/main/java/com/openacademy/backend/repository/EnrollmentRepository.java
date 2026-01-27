package com.openacademy.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.openacademy.backend.entities.Enrollment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

  // Check if a student is already enrolled (prevents double joining)
  boolean existsByCourseIdAndStudentId(Long courseId, Long studentId);

  // Get a specific enrollment record (useful for dropping a course or getting
  // their current grade)
  Optional<Enrollment> findByCourseIdAndStudentId(Long courseId, Long studentId);

  // Get all enrollments for a course (e.g., for the "Class Roster" view)
  List<Enrollment> findByCourseId(Long courseId);

  // In EnrollmentRepository
  @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId")
  List<Enrollment> findAllByStudentId(Long studentId);

  List<Enrollment> findCoursesByStudentId(Long StudentId);

  void deleteByStudentId(Long studentId);

}