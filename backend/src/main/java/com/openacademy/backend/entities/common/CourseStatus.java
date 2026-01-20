package com.openacademy.backend.entities.common;

public enum CourseStatus {
  DRAFT, // Created but not visible to students
  PUBLISHED, // Visible and open for enrollment
  IN_PROGRESS, // Currently active
  COMPLETED, // Finished, read-only
  ARCHIVED // Hidden from main dashboards
}