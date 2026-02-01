package com.openacademy.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndPassword(String email, String password);

    Optional<User> findByEmailAndRole(String email, Role role);

    int countByRole(Role role);
}
