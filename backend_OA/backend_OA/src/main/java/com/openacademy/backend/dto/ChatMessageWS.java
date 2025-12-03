package com.openacademy.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageWS {
    private Long groupId;
    private Long senderId;
    private String content;
}
