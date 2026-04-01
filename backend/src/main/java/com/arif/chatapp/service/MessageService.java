package com.arif.chatapp.service;

import com.arif.chatapp.model.ChatRequest;
import com.arif.chatapp.model.Message;
import com.arif.chatapp.model.User;
import com.arif.chatapp.repository.ChatRepository;
import com.arif.chatapp.repository.ChatRequestRepository;
import com.arif.chatapp.repository.MessageRepository;
import com.arif.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ChatRequestRepository chatRequestRepository;
    private final ChatRepository chatRepository;

    public Message sendMessageByEmail(String senderEmail, String receiverEmail, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        boolean chatExists = chatRepository.existsByUser1AndUser2OrUser1AndUser2(
                sender,
                receiver,
                receiver,
                sender
        );

        boolean acceptedRequest = chatRequestRepository.findBySenderAndReceiver(sender, receiver)
                .filter(request -> request.getStatus() == ChatRequest.Status.ACCEPTED)
                .isPresent()
                || chatRequestRepository.findBySenderAndReceiver(receiver, sender)
                .filter(request -> request.getStatus() == ChatRequest.Status.ACCEPTED)
                .isPresent();

        if (!chatExists && !acceptedRequest) {
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

        public void deleteChatMessages(Long userId, Long partnerId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                User partner = userRepository.findById(partnerId)
                                .orElseThrow(() -> new IllegalArgumentException("Partner not found"));

                List<Message> toDelete = new ArrayList<>();
                toDelete.addAll(messageRepository.findBySenderAndReceiver(user, partner));
                toDelete.addAll(messageRepository.findBySenderAndReceiver(partner, user));

                if (!toDelete.isEmpty()) {
                        messageRepository.deleteAll(toDelete);
                }
        }

        public void deleteMessagesForUser(Long userId, Long chatPartnerId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                User partner = userRepository.findById(chatPartnerId)
                                .orElseThrow(() -> new IllegalArgumentException("Partner not found"));

                List<Message> messages = new ArrayList<>();
                messages.addAll(messageRepository.findBySenderAndReceiver(user, partner));
                messages.addAll(messageRepository.findBySenderAndReceiver(partner, user));

                if (messages.isEmpty()) {
                        return;
                }

                for (Message message : messages) {
                        if (user.equals(message.getSender())) {
                                message.setDeletedForSender(true);
                        }
                        if (user.equals(message.getReceiver())) {
                                message.setDeletedForReceiver(true);
                        }
                }

                messageRepository.saveAll(messages);
        }
}
