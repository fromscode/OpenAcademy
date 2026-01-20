package com.openacademy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.StudentDashboardDTO;
import com.openacademy.backend.entities.Assignment;
import com.openacademy.backend.entities.Enrollment;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.AssignmentRepository;
import com.openacademy.backend.repository.EnrollmentRepository;
import com.openacademy.backend.repository.SubmissionRepository;
import com.openacademy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

  private final UserRepository userRepository;
  private final EnrollmentRepository enrollmentRepository;
  private final AssignmentRepository assignmentRepository;
  private final SubmissionRepository submissionRepository;

  public StudentDashboardDTO getStudentDashboard(Long studentId) {
    // 1. Get the Student
    User student = userRepository.findById(studentId)
        .orElseThrow(() -> new RuntimeException("Student not found"));

    // 2. Get Active Courses & Grades
    // We use the Enrollment table because it has the 'currentGrade' cached
    List<Enrollment> enrollments = enrollmentRepository.findCoursesByStudentId(studentId); // *See note below on Repo
                                                                                           // update

    List<StudentDashboardDTO.CourseSummary> courseSummaries = enrollments.stream()
        .map(e -> StudentDashboardDTO.CourseSummary.builder()
            .courseId(e.getCourse().getId())
            .courseTitle(e.getCourse().getTitle())
            .courseCode(e.getCourse().getCourseCode())
            .currentGrade(e.getCurrentGrade())
            .build())
        .collect(Collectors.toList());

    // 3. Get Upcoming Assignments (Due in the future)
    // This logic can be complex. Here is a simplified version:
    // "Find all assignments for my courses where due_date > now"
    List<StudentDashboardDTO.UpcomingTask> upcomingTasks = new ArrayList<>();

    for (Enrollment enrollment : enrollments) {
      List<Assignment> courseAssignments = assignmentRepository.findByCourseId(enrollment.getCourse().getId());

      for (Assignment a : courseAssignments) {
        // Only show if due date is in the future (or very recently passed)
        if (a.getDueDate().isAfter(LocalDateTime.now())) {
          // Check if already submitted? (Optional optimization: query submission repo)
          upcomingTasks.add(StudentDashboardDTO.UpcomingTask.builder()
              .assignmentId(a.getId())
              .courseTitle(enrollment.getCourse().getTitle())
              .assignmentTitle(a.getTitle())
              .dueDate(a.getDueDate())
              .isOverdue(false)
              .build());
        }
      }
    }

    // Sort tasks by due date (soonest first)
    upcomingTasks.sort(Comparator.comparing(StudentDashboardDTO.UpcomingTask::getDueDate));

    // 4. Get Recent Grades (Last 5 graded items)
    // We need a custom query in SubmissionRepository for
    // "findTop5ByStudentIdOrderByGradedAtDesc"
    // For now, let's assume we fetch list and stream it (not performant for huge
    // data, but fine for MVP)
    // *Ideally add:
    // findTop5ByStudentIdAndGradeIsNotNullOrderByGradedAtDesc(studentId) to Repo*

    // Mocking the result for this snippet:
    List<StudentDashboardDTO.RecentGrade> recentGrades = new ArrayList<>();
    // Populate this using the repository method mentioned above

    return StudentDashboardDTO.builder()
        .studentName(student.getFullName())
        .activeCourses(courseSummaries)
        .upcomingAssignments(upcomingTasks) // limit to top 5 if needed
        .recentGrades(recentGrades)
        .build();
  }
}