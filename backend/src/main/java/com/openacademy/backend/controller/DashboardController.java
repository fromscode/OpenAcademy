package com.openacademy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.openacademy.backend.dto.StudentDashboardDTO;
import com.openacademy.backend.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class DashboardController {

  private final DashboardService dashboardService;

  // GET /api/dashboard/student/{studentId}
  @GetMapping("/student/{studentId}")
  public ResponseEntity<StudentDashboardDTO> getStudentDashboard(@PathVariable Long studentId) {
    return ResponseEntity.ok(dashboardService.getStudentDashboard(studentId));
  }
}
