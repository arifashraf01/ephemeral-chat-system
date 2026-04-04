package com.arif.chatapp.dto;

import com.arif.chatapp.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private String senderEmail;
    private String receiverEmail;
    private String content;
    private LocalDateTime timestamp;
    private Message.Status status;
}
