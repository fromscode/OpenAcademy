package com.openacademy.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.CreateAdminRequest;
import com.openacademy.backend.dto.CreateStudentRequest;
import com.openacademy.backend.dto.CreateTeacherRequest;
import com.openacademy.backend.dto.UpdateAdminRequest;
import com.openacademy.backend.dto.UpdateStudentRequest;
import com.openacademy.backend.dto.UpdateTeacherRequest;
import com.openacademy.backend.entities.Admin;
import com.openacademy.backend.entities.Course;
import com.openacademy.backend.entities.Student;
import com.openacademy.backend.entities.Teacher;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;
import com.openacademy.backend.repository.AdminRepository;
import com.openacademy.backend.repository.CourseRepository;
import com.openacademy.backend.repository.EnrollmentRepository;
import com.openacademy.backend.repository.GroupMemberRepository;
import com.openacademy.backend.repository.MessageRepository;
import com.openacademy.backend.repository.StudentRepository;
import com.openacademy.backend.repository.SubmissionRepository;
import com.openacademy.backend.repository.TeacherRepository;
import com.openacademy.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

  private final UserRepository userRepository;
  private final StudentRepository studentRepository;
  private final TeacherRepository teacherRepository;
  private final CourseRepository courseRepository;
  private final EnrollmentRepository enrollmentRepository;
  private final SubmissionRepository submissionRepository;
  private final MessageRepository chatMessageRepository;
  private final GroupMemberRepository groupMemberRepository;
  private final AdminRepository adminRepository;
  // private final PasswordEncoder passwordEncoder; // Uncomment when you add
  // Security

  // --- VIEW METHODS ---

  public List<Student> getAllStudents() {
    return studentRepository.findAll();
  }

  public List<Teacher> getAllTeachers() {
    return teacherRepository.findAll();
  }

  // --- CREATE METHODS ---

  @Transactional
  public Teacher createTeacher(CreateTeacherRequest request) {
    // 1. Create and Save the generic User first
    User user = new User();
    user.setFirstName(request.getFirstName());
    user.setMiddleName(request.getMiddleName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPhoneNumber(request.getPhoneNumber());
    user.setRole(Role.TEACHER);

    // IMPORTANT: Encrypt password in real app
    // user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setPassword(request.getPassword());

    User savedUser = userRepository.save(user);

    // 2. Create the Teacher specific entity
    Teacher teacher = new Teacher();
    teacher.setUser(savedUser); // @MapsId will take the ID from here
    teacher.setEducation(request.getEducation());

    return teacherRepository.save(teacher);
  }

  @Transactional
  public Student createStudent(CreateStudentRequest request) {
    // 1. Create User
    User user = new User();
    user.setFirstName(request.getFirstName());
    user.setMiddleName(request.getMiddleName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPhoneNumber(request.getPhoneNumber());
    user.setRole(Role.STUDENT);
    user.setPassword(request.getPassword()); // Remember to encrypt!

    User savedUser = userRepository.save(user);

    // 2. Create Student
    Student student = new Student();
    student.setUser(savedUser);
    student.setDateOfBirth(request.getDateOfBirth());

    return studentRepository.save(student);
  }

  @Transactional
  public Admin createAdmin(CreateAdminRequest request) {
    // 1. Create User
    User user = new User();
    user.setFirstName(request.getFirstName());
    user.setMiddleName(request.getMiddleName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPhoneNumber(request.getPhoneNumber());
    user.setRole(Role.ADMIN);
    user.setPassword(request.getPassword()); // Remember to encrypt!

    User savedUser = userRepository.save(user);

    // 2. Create Admin
    Admin admin = new Admin();
    admin.setUser(savedUser);

    return adminRepository.save(admin);
  }

  // --- UPDATE METHODS ---

  @Transactional
  public Teacher updateTeacher(Long id, UpdateTeacherRequest request) {
    Teacher teacher = teacherRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Teacher not found"));

    // Update User details
    User user = teacher.getUser();
    if (request.getFirstName() != null)
      user.setFirstName(request.getFirstName());
    if (request.getMiddleName() != null)
      user.setMiddleName(request.getMiddleName());
    if (request.getLastName() != null)
      user.setLastName(request.getLastName());
    if (request.getPhoneNumber() != null)
      user.setPhoneNumber(request.getPhoneNumber());

    // Update Teacher details
    if (request.getEducation() != null)
      teacher.setEducation(request.getEducation());

    return teacherRepository.save(teacher);
  }

  @Transactional
  public Student updateStudent(Long id, UpdateStudentRequest request) {
    Student student = studentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Student not found"));

    User user = student.getUser();
    if (request.getFirstName() != null)
      user.setFirstName(request.getFirstName());
    if (request.getMiddleName() != null)
      user.setMiddleName(request.getMiddleName());
    if (request.getLastName() != null)
      user.setLastName(request.getLastName());
    if (request.getPhoneNumber() != null)
      user.setPhoneNumber(request.getPhoneNumber());

    if (request.getDateOfBirth() != null)
      student.setDateOfBirth(request.getDateOfBirth());

    return studentRepository.save(student);
  }

  @Transactional
  public Admin updateAdminByEmail(String currentEmail, UpdateAdminRequest request) {
    User user = userRepository.findByEmail(currentEmail)
        .orElseThrow(() -> new RuntimeException("Admin user not found by email"));

    Admin admin = adminRepository.findById(user.getId())
        .orElseThrow(() -> new RuntimeException("Admin not found"));

    // Only update fields that are provided and non-blank
    if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty())
      user.setFirstName(request.getFirstName().trim());
    if (request.getMiddleName() != null && !request.getMiddleName().trim().isEmpty())
      user.setMiddleName(request.getMiddleName().trim());
    if (request.getLastName() != null && !request.getLastName().trim().isEmpty())
      user.setLastName(request.getLastName().trim());
    if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty())
      user.setPhoneNumber(request.getPhoneNumber().trim());
    if (request.getEmail() != null && !request.getEmail().trim().isEmpty())
      user.setEmail(request.getEmail().trim());
    if (request.getPassword() != null && !request.getPassword().trim().isEmpty())
      user.setPassword(request.getPassword()); // encrypt in real app

    userRepository.save(user);
    return adminRepository.save(admin);
  }

  // --- DELETE METHODS ---

  // --- HARD DELETE STUDENT ---
  @Transactional
  public void deleteStudent(Long id) {
    if (!studentRepository.existsById(id)) {
      throw new RuntimeException("Student not found");
    }

    // 1. Delete all Submissions made by this student
    submissionRepository.deleteByStudentId(id);

    // 2. Delete all Enrollments for this student
    enrollmentRepository.deleteByStudentId(id);

    // 3. Delete all Chat Messages sent by this student
    chatMessageRepository.deleteBySenderId(id);

    // 4. Remove student from any Chat Groups
    groupMemberRepository.deleteByUserId(id);

    // 5. Finally, delete the Student and User entities
    studentRepository.deleteById(id);
    userRepository.deleteById(id);

  }

  // --- HARD DELETE TEACHER ---
  @Transactional
  public void deleteTeacher(Long id) {
    if (!teacherRepository.existsById(id)) {
      throw new RuntimeException("Teacher not found");
    }

    // 1. Delete ALL Submissions for ALL courses taught by this teacher
    // (If we don't do this, we can't delete the Assignments later)
    submissionRepository.deleteByInstructorId(id);

    // 2. Find all courses taught by this teacher
    List<Course> courses = courseRepository.findByInstructorId(id);

    // 3. Delete those courses
    // Because Course.java has `cascade = CascadeType.ALL` on `assignments` and
    // `enrollments`,
    // deleting the Course will automatically wipe its Assignments and Enrollments.
    courseRepository.deleteAll(courses);

    // 4. Delete Chat Messages sent by this teacher
    chatMessageRepository.deleteBySenderId(id);

    // 5. Remove teacher from any Chat Groups
    groupMemberRepository.deleteByUserId(id);

    // 6. Finally, delete the Teacher and User entities
    teacherRepository.deleteById(id);
    userRepository.deleteById(id);
  }
}
