package com.openacademy.backend.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.openacademy.backend.entities.Student;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;

@DataJpaTest
public class StudentRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    private User user;
    private Student student;

    @BeforeEach
    public void initializeUser() {
        user = new User();
        user.setEmail("test@example.com");
        user.setPassword("babababa");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setRole(Role.STUDENT);
        user.setPhoneNumber("1010101010");

        student = new Student();
        student.setUser(user);
        student.setDateOfBirth(LocalDate.of(2022, 12, 18));
    }

    @Test
    public void studentIdMatchesUserId() {
        userRepository.save(user);
        studentRepository.save(student);

        Optional<User> fetchedUser = userRepository.findById(user.getId());
        Optional<Student> fetchedStudent = studentRepository.findById(user.getId());
        assertTrue(fetchedUser.isPresent());
        assertTrue(fetchedStudent.isPresent());
        assertEquals(fetchedUser.get().getId(), fetchedStudent.get().getUserId());
    }
}
