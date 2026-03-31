package com.arif.chatapp.controller;

import com.arif.chatapp.dto.ApiResponse;
import com.arif.chatapp.dto.ChatRequestResponse;
import com.arif.chatapp.dto.SendChatRequestRequest;
import com.arif.chatapp.service.ChatRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatRequestController {

    private final ChatRequestService chatRequestService;

    @PostMapping("/requests/send")
    public ResponseEntity<ApiResponse<Object>> send(
            @Valid @RequestBody SendChatRequestRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authorization header is required");
        }

        chatRequestService.sendRequest(authentication.getName(), request.getReceiverEmail());

        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("Request sent")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests/incoming")
    public List<ChatRequestResponse> incoming(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authorization header is required");
        }
        return chatRequestService.getIncomingRequests(authentication.getName());
    }

    @GetMapping("/requests/sent")
    public List<ChatRequestResponse> sent(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authorization header is required");
        }
        return chatRequestService.getSentRequests(authentication.getName());
    }

    @PostMapping("/requests/accept")
    public void accept(@RequestParam Long requestId, @RequestParam Long userId) {
        chatRequestService.acceptRequest(requestId, userId);
    }

    @PostMapping("/requests/reject")
    public void reject(@RequestParam Long requestId, @RequestParam Long userId) {
        chatRequestService.rejectRequest(requestId, userId);
    }
}
