package com.openacademy.backend.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.openacademy.backend.entity.Admin;
import com.openacademy.backend.entity.User;
import com.openacademy.backend.entity.common.Role;

@DataJpaTest
public class AdminRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    private User user;
    private Admin admin;

    @BeforeEach
    public void initializeUser() {
        user = new User();
        user.setEmail("test@example.com");
        user.setPassword("babababa");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setRole(Role.STUDENT);
        user.setPhoneNumber("1010101010");

        admin = new Admin();
        admin.setUser(user);
    }

    @Test
    public void adminIdMatchesUserId() {
        userRepository.save(user);
        adminRepository.save(admin);

        Optional<User> fetchedUser = userRepository.findById(user.getId());
        Optional<Admin> fetchedAdmin = adminRepository.findById(user.getId());
        assertTrue(fetchedUser.isPresent());
        assertTrue(fetchedAdmin.isPresent());
        assertEquals(fetchedUser.get().getId(), fetchedAdmin.get().getId());
    }
}
