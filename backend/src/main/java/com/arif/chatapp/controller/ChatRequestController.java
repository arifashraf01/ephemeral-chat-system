package com.arif.chatapp.controller;

import com.arif.chatapp.service.ChatRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
public class ChatRequestController {

    private final ChatRequestService chatRequestService;

    @PostMapping("/send")
    public void send(@RequestParam Long senderId, @RequestParam Long receiverId) {
        chatRequestService.sendRequest(senderId, receiverId);
    }

    @PostMapping("/accept")
    public void accept(@RequestParam Long requestId, @RequestParam Long userId) {
        chatRequestService.acceptRequest(requestId, userId);
    }

    @PostMapping("/reject")
    public void reject(@RequestParam Long requestId, @RequestParam Long userId) {
        chatRequestService.rejectRequest(requestId, userId);
    }
}
