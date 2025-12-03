package com.openacademy.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.openacademy.backend.entities.ChatMessage;

public interface MessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByGroupIdOrderByCreatedAtAsc(Long groupId);

    List<ChatMessage> findTop50ByGroupIdOrderByCreatedAtDesc(Long groupId);
}
