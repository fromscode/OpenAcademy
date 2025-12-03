package com.openacademy.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ChatMessage sendMessage(@RequestParam Long groupId,
            @RequestParam Long userId,
            @RequestParam String content) {
        return chatMessageService.sendMessage(groupId, userId, content);
    }

    // get all messages of a group
    @PostMapping("/group/{groupId}")
    public List<ChatMessage> getMessagesByGroup(@PathVariable Long groupId) {
        return chatMessageService.getMessagesByGroup(groupId);
    }

}
