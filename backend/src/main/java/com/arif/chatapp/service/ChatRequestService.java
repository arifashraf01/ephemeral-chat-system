package com.arif.chatapp.service;

import com.arif.chatapp.model.ChatRequest;
import com.arif.chatapp.model.User;
import com.arif.chatapp.repository.ChatRequestRepository;
import com.arif.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ChatRequestService {

    private final UserRepository userRepository;
    private final ChatRequestRepository chatRequestRepository;

    public void sendRequest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Cannot send request to yourself");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        chatRequestRepository.findBySenderAndReceiver(sender, receiver)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Request already exists");
                });

        ChatRequest request = ChatRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(ChatRequest.Status.PENDING)
                .createdAt(Instant.now())
                .build();

        chatRequestRepository.save(request);
    }

    public void acceptRequest(Long requestId, Long userId) {
        // TODO: implement accept request logic
    }

    public void rejectRequest(Long requestId, Long userId) {
        // TODO: implement reject request logic
    }
}
