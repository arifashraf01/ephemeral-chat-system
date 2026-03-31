package com.arif.chatapp.service;

import com.arif.chatapp.model.ChatRequest;
import com.arif.chatapp.model.User;
import com.arif.chatapp.repository.ChatRequestRepository;
import com.arif.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRequestService {

    private final UserRepository userRepository;
    private final ChatRequestRepository chatRequestRepository;

        public void sendRequest(String senderEmail, String receiverEmail) {
        User sender = userRepository.findByEmail(senderEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        User receiver = userRepository.findByEmail(receiverEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Cannot send request to yourself");
        }

        boolean exists = chatRequestRepository.existsBySenderAndReceiverOrSenderAndReceiver(
            sender,
            receiver,
            receiver,
            sender
        );
        if (exists) {
            throw new IllegalArgumentException("Request already exists");
        }

        ChatRequest request = ChatRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(ChatRequest.Status.PENDING)
                .createdAt(Instant.now())
                .build();

        chatRequestRepository.save(request);
        log.info("Chat request created: sender={} receiver={} status=PENDING", senderEmail, receiverEmail);
    }

    public void acceptRequest(Long requestId, Long userId) {
        ChatRequest request = chatRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("Only receiver can accept the request");
        }

        if (request.getStatus() != ChatRequest.Status.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }

        request.setStatus(ChatRequest.Status.ACCEPTED);
        chatRequestRepository.save(request);
    }

    public void rejectRequest(Long requestId, Long userId) {
        ChatRequest request = chatRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("Only receiver can reject the request");
        }

        if (request.getStatus() != ChatRequest.Status.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }

        request.setStatus(ChatRequest.Status.REJECTED);
        chatRequestRepository.save(request);
    }
}
