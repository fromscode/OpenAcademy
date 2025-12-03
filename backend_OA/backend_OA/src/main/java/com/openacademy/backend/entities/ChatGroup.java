package com.openacademy.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "chat_groups")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
