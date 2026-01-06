package com.openacademy.backend.repository;

import com.openacademy.backend.entities.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
    
    @Query("SELECT g FROM ChatGroup g JOIN GroupMember gm ON g.id = gm.group.id WHERE gm.user.id = :userId")
    List<ChatGroup> findGroupsByUserId(@Param("userId") Long userId);
}