package com.arif.chatapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class ChatSummaryResponse {
    private Long id;
    private String user1Email;
    private String user2Email;
    private Instant createdAt;
}
