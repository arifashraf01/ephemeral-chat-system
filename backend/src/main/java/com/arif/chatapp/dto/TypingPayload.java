package com.arif.chatapp.dto;

import lombok.Data;

@Data
public class TypingPayload {
    private String senderEmail;
    private String receiverEmail;
}
