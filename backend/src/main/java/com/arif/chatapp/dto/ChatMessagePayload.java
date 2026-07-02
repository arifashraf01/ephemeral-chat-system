package com.arif.chatapp.dto;

import lombok.Data;

@Data
public class ChatMessagePayload {
    private String receiverEmail;
    private String content;
}
