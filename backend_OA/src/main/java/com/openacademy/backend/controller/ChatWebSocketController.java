package com.openacademy.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.openacademy.backend.dto.ChatMessageWS;
import com.openacademy.backend.entities.ChatMessage;
import com.openacademy.backend.service.ChatMessageService;

@Controller
@SuppressWarnings("null")
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate, ChatMessageService chatMessageService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageWS chatMessageWS) {

        // save the message to the database
        ChatMessage savedMessage = chatMessageService.sendMessage(
                chatMessageWS.getGroupId(), chatMessageWS.getSenderId(), chatMessageWS.getContent());

        // Broadcast the message to all subscribers of the group
        messagingTemplate.convertAndSend("/topic/group/" + chatMessageWS.getGroupId(), savedMessage);
    }

}
