package com.arif.chatapp.dto;

import com.arif.chatapp.model.ChatRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatRequestResponse {
    private Long id;
    private String senderEmail;
    private String receiverEmail;
    private ChatRequest.Status status;
}
