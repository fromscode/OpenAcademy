package com.openacademy.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.openacademy.backend.dto.CreateStudentRequest;
import com.openacademy.backend.dto.CreateTeacherRequest;
import com.openacademy.backend.dto.UpdateAdminRequest;
import com.openacademy.backend.dto.UpdateStudentRequest;
import com.openacademy.backend.dto.UpdateTeacherRequest;
import com.openacademy.backend.entities.Admin;
import com.openacademy.backend.entities.Student;
import com.openacademy.backend.entities.Teacher;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;
import com.openacademy.backend.repository.AdminRepository;
import com.openacademy.backend.repository.StudentRepository;
import com.openacademy.backend.repository.TeacherRepository;
import com.openacademy.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

  private final UserRepository userRepository;
  private final TeacherRepository teacherRepository;
  private final StudentRepository studentRepository;
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

  // --- UPDATE METHODS ---

  @Transactional
  public Teacher updateTeacher(Long id, UpdateTeacherRequest request) {
    Teacher teacher = teacherRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Teacher not found"));

    // Update User details
    User user = teacher.getUser();
    if (request.getFirstName() != null)
      user.setFirstName(request.getFirstName());
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
    if (request.getLastName() != null)
      user.setLastName(request.getLastName());
    if (request.getPhoneNumber() != null)
      user.setPhoneNumber(request.getPhoneNumber());

    if (request.getDateOfBirth() != null)
      student.setDateOfBirth(request.getDateOfBirth());

    return studentRepository.save(student);
  }

  @Transactional
  public Admin updateAdmin(Long id, UpdateAdminRequest request) {
    Admin admin = adminRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Admin not found"));

    User user = admin.getUser();
    if (request.getFirstName() != null)
      user.setFirstName(request.getFirstName());
    if (request.getLastName() != null)
      user.setLastName(request.getLastName());
    if (request.getPhoneNumber() != null)
      user.setPhoneNumber(request.getPhoneNumber());

    return adminRepository.save(admin);
  }

  // --- DELETE METHODS ---

  @Transactional
  public void deleteTeacher(Long id) {
    if (!teacherRepository.existsById(id)) {
      throw new RuntimeException("Teacher not found");
    }
    // Because of @MapsId, deleting the child (Teacher) usually leaves the User
    // orphan
    // OR throws constraint errors depending on DB setup.
    // Best practice: Delete the generic User, and let Cascade handle the child.
    // BUT, since your User entity does NOT have 'mappedBy' and
    // 'CascadeType.REMOVE',
    // we must manually delete both to be safe and clean.

    teacherRepository.deleteById(id); // Delete from 'teachers' table
    userRepository.deleteById(id); // Delete from 'users' table
  }

  @Transactional
  public void deleteStudent(Long id) {
    if (!studentRepository.existsById(id)) {
      throw new RuntimeException("Student not found");
    }
    studentRepository.deleteById(id);
    userRepository.deleteById(id);
  }
}
