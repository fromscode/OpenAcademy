package com.openacademy.backend.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;

@DataJpaTest
public class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    public void initializeUser() {
        user = new User();
        user.setEmail("test@example.com");
        user.setPassword("babababa");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setRole(Role.STUDENT);
        user.setPhoneNumber("1010101010");
    }

    @Test
    public void findByEmailReturnsCorrectUser() {
        userRepository.save(user);
        Optional<User> fetchedUser = userRepository.findByEmail("test@example.com");
        assertTrue(fetchedUser.isPresent());
        assertEquals(fetchedUser.get().getEmail(), user.getEmail());
    }

    @Test
    public void getFullNameReturnsCorrectFullName() {
        assertEquals(user.getFullName(), "John Doe");
        user.setMiddleName("Betty");
        assertEquals(user.getFullName(), "John Betty Doe");
    }
}
