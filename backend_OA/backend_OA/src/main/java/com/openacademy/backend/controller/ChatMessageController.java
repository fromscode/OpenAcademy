package com.openacademy.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openacademy.backend.dto.ChatMessageWS;
import com.openacademy.backend.entities.ChatMessage;
import com.openacademy.backend.service.ChatMessageService;

@RestController
@RequestMapping("/api/chat/messages")
public class ChatMessageController {
    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    // send message
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageWS chatMessageWS) {
        System.out.println("Received chatMessageWS:" + chatMessageWS.getContent()); // debug
        try {
            Long groupId = chatMessageWS.getGroupId();
            Long userId = chatMessageWS.getSenderId();
            String content = chatMessageWS.getContent();
            ChatMessage message = chatMessageService.sendMessage(groupId, userId, content);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // get all messages of a group - requires userId to check membership
    @PostMapping("/group/{groupId}/{userId}")
    public ResponseEntity<?> getMessagesByGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        try {
            List<ChatMessage> messages = chatMessageService.getMessagesByGroup(groupId, userId);
            return ResponseEntity.ok(messages);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{userId}/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long userId, @PathVariable Long messageId) {
        try {
            chatMessageService.deleteMessage(messageId, userId);
            return ResponseEntity.ok("Message deleted successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

}
