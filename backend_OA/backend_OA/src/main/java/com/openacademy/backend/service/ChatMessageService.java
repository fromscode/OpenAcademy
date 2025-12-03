package com.openacademy.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.openacademy.backend.entities.ChatGroup;
import com.openacademy.backend.entities.ChatMessage;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.ChatGroupRepository;
import com.openacademy.backend.repository.MessageRepository;
import com.openacademy.backend.repository.UserRepository;

@Service
@SuppressWarnings("null")
public class ChatMessageService {

    private final MessageRepository messageRepo;
    private final ChatGroupRepository groupRepo;
    private final UserRepository userRepo;

    public ChatMessageService(MessageRepository messageRepo, ChatGroupRepository groupRepo, UserRepository userRepo) {
        this.messageRepo = messageRepo;
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
    }

    // sending message
    public ChatMessage sendMessage(Long groupId, Long userId, String content) {

        ChatGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        User sender = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChatMessage message = new ChatMessage();

        message.setGroup(group);
        message.setSender(sender);
        message.setContent(content);

        return messageRepo.save(message);
    }

    // Get all messages for a group
    public List<ChatMessage> getMessagesByGroup(Long groupId) {
        return messageRepo.findByGroupIdOrderByCreatedAtAsc(groupId);
    }

}
