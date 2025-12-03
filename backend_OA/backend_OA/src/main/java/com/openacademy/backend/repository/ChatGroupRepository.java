package com.openacademy.backend.repository;

import com.openacademy.backend.entities.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
}