package com.arif.chatapp.controller;

import com.arif.chatapp.dto.ApiResponse;
import com.arif.chatapp.dto.ChatMessageResponse;
import com.arif.chatapp.dto.SendMessageRequest;
import com.arif.chatapp.model.Message;
import com.arif.chatapp.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Object>> send(
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authorization header is required");
        }

        Message saved = messageService.sendMessageByEmail(
                authentication.getName(),
                request.getReceiverEmail(),
                request.getContent()
        );

        ChatMessageResponse savedResponse = messageService.toChatMessageResponse(saved);
        messagingTemplate.convertAndSend("/topic/messages/" + request.getReceiverEmail(), savedResponse);

        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("Message sent")
                .data(savedResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<ChatMessageResponse>> conversation(
            @RequestParam String partnerEmail,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authorization header is required");
        }

        List<ChatMessageResponse> response = messageService.getConversationByEmail(
                authentication.getName(),
                partnerEmail
            )
                .stream()
                .map(messageService::toChatMessageResponse)
                .toList();

        return ResponseEntity.ok(response);
            }
}
