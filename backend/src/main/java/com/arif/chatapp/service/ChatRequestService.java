package com.arif.chatapp.service;

import com.arif.chatapp.dto.ChatSummaryResponse;
import com.arif.chatapp.dto.ChatRequestResponse;
import com.arif.chatapp.model.Chat;
import com.arif.chatapp.model.ChatRequest;
import com.arif.chatapp.model.User;
import com.arif.chatapp.repository.ChatRepository;
import com.arif.chatapp.repository.ChatRequestRepository;
import com.arif.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRequestService {

    private final UserRepository userRepository;
    private final ChatRequestRepository chatRequestRepository;
    private final ChatRepository chatRepository;

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

    public void acceptRequest(Long requestId, String currentUserEmail) {
        ChatRequest request = chatRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!request.getReceiver().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Only receiver can accept the request");
        }

        if (request.getStatus() != ChatRequest.Status.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }

        request.setStatus(ChatRequest.Status.ACCEPTED);
        chatRequestRepository.save(request);

        User sender = request.getSender();
        User receiver = request.getReceiver();

        Chat chat = Chat.builder()
                .user1(sender)
                .user2(receiver)
                .build();
        chatRepository.save(chat);

        log.info("Chat created between {} and {}", sender.getEmail(), receiver.getEmail());
    }

    public void rejectRequest(Long requestId, String currentUserEmail) {
        ChatRequest request = chatRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!request.getReceiver().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Only receiver can reject the request");
        }

        if (request.getStatus() != ChatRequest.Status.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }

        request.setStatus(ChatRequest.Status.REJECTED);
        chatRequestRepository.save(request);
    }

    public List<ChatRequestResponse> getIncomingRequests(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return chatRequestRepository.findByReceiver(currentUser)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ChatRequestResponse> getSentRequests(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return chatRequestRepository.findBySender(currentUser)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ChatRequestResponse toResponse(ChatRequest request) {
        return new ChatRequestResponse(
                request.getId(),
                request.getSender().getEmail(),
                request.getReceiver().getEmail(),
                request.getStatus()
        );
    }

    public List<ChatSummaryResponse> getChatsForUser(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Backfill chats for requests that were accepted before chat creation logic was added.
        List<ChatRequest> acceptedRequests = chatRequestRepository.findBySenderAndStatusOrReceiverAndStatus(
                currentUser,
                ChatRequest.Status.ACCEPTED,
                currentUser,
                ChatRequest.Status.ACCEPTED
        );

        for (ChatRequest acceptedRequest : acceptedRequests) {
            User sender = acceptedRequest.getSender();
            User receiver = acceptedRequest.getReceiver();
            boolean exists = chatRepository.existsByUser1AndUser2OrUser1AndUser2(
                    sender,
                    receiver,
                    receiver,
                    sender
            );
            if (!exists) {
                Chat chat = Chat.builder()
                        .user1(sender)
                        .user2(receiver)
                        .build();
                chatRepository.save(chat);
                log.info("Backfilled chat between {} and {}", sender.getEmail(), receiver.getEmail());
            }
        }

        return chatRepository.findByUser1OrUser2(currentUser, currentUser)
                .stream()
                .map(chat -> new ChatSummaryResponse(
                        chat.getId(),
                        chat.getUser1().getEmail(),
                        chat.getUser2().getEmail(),
                        chat.getCreatedAt()
                ))
                .toList();
    }
}
