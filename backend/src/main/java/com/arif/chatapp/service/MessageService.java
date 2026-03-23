package com.arif.chatapp.service;

import com.arif.chatapp.model.ChatRequest;
import com.arif.chatapp.model.Message;
import com.arif.chatapp.model.User;
import com.arif.chatapp.repository.ChatRequestRepository;
import com.arif.chatapp.repository.MessageRepository;
import com.arif.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ChatRequestRepository chatRequestRepository;

    public Message sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        boolean accepted = chatRequestRepository.findBySenderAndReceiver(sender, receiver)
                .filter(request -> request.getStatus() == ChatRequest.Status.ACCEPTED)
                .isPresent()
                || chatRequestRepository.findBySenderAndReceiver(receiver, sender)
                .filter(request -> request.getStatus() == ChatRequest.Status.ACCEPTED)
                .isPresent();

        if (!accepted) {
            throw new IllegalStateException("Chat not allowed");
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

        public void markAsSeen(Long messageId) {
                Message message = messageRepository.findById(messageId)
                                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
                message.setStatus(Message.Status.SEEN);
                messageRepository.save(message);
        }
}
