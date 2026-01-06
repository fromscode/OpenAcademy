package com.openacademy.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.openacademy.backend.entities.ChatGroup;
import com.openacademy.backend.entities.ChatMessage;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.ChatGroupRepository;
import com.openacademy.backend.repository.GroupMemberRepository;
import com.openacademy.backend.repository.MessageRepository;
import com.openacademy.backend.repository.UserRepository;

@Service
@SuppressWarnings("null")
public class ChatMessageService {

    private final MessageRepository messageRepo;
    private final ChatGroupRepository groupRepo;
    private final UserRepository userRepo;
    private final GroupMemberRepository memberRepo;

    public ChatMessageService(MessageRepository messageRepo, ChatGroupRepository groupRepo,
            UserRepository userRepo, GroupMemberRepository memberRepo) {
        this.messageRepo = messageRepo;
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
        this.memberRepo = memberRepo;
    }

    // sending message - with membership check
    public ChatMessage sendMessage(Long groupId, Long userId, String content) {

        // Check if user is a member of the group
        if (!memberRepo.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

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

    // Get all messages for a group - with membership check
    public List<ChatMessage> getMessagesByGroup(Long groupId, Long userId) {

        // Check if user is a member of the group
        if (!memberRepo.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

        return messageRepo.findByGroupIdOrderByCreatedAtAsc(groupId);
    }

    // Delete message - only sender can delete
    public void deleteMessage(Long messageId, Long userId) {
        ChatMessage message = messageRepo.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("User is not the sender of this message");
        }

        messageRepo.delete(message);
    }

}
