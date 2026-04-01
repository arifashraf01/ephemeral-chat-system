package com.arif.chatapp.controller;

import com.arif.chatapp.dto.ApiResponse;
import com.arif.chatapp.dto.SendMessageRequest;
import com.arif.chatapp.model.Message;
import com.arif.chatapp.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

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

        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("Message sent")
                .data(Map.of("id", saved.getId()))
                .build();

        return ResponseEntity.ok(response);
    }
}
