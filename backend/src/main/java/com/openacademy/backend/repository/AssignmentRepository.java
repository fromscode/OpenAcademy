package com.openacademy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.openacademy.backend.entities.Assignment;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

  // Get all assignments for a specific course
  List<Assignment> findByCourseId(Long courseId);

  // Get assignments for a course, ordered by due date (soonest first)
  List<Assignment> findByCourseIdOrderByDueDateAsc(Long courseId);
}