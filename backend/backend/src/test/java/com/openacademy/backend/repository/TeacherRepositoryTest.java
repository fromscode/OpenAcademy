package com.openacademy.backend.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.openacademy.backend.entities.Teacher;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;

@DataJpaTest
public class TeacherRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    private User user;
    private Teacher teacher;

    @BeforeEach
    public void initializeUser() {
        user = new User();
        user.setEmail("test@example.com");
        user.setPassword("babababa");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setRole(Role.STUDENT);
        user.setPhoneNumber("1010101010");

        teacher = new Teacher();
        teacher.setUser(user);
        teacher.setEducation("Phd");
    }

    @Test
    public void teacherIdMatchesUserId() {
        userRepository.save(user);
        teacherRepository.save(teacher);

        Optional<User> fetchedUser = userRepository.findById(user.getId());
        Optional<Teacher> fetchedTeacher = teacherRepository.findById(user.getId());
        assertTrue(fetchedUser.isPresent());
        assertTrue(fetchedTeacher.isPresent());
        assertEquals(fetchedUser.get().getId(), fetchedTeacher.get().getId());
    }
}
