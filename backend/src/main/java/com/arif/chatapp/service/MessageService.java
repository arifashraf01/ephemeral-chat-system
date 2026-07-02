package com.arif.chatapp.service;

import com.arif.chatapp.dto.ChatMessageResponse;
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

    private boolean isChatAllowed(User sender, User receiver) {
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

        return chatExists || acceptedRequest;
    }

    @org.springframework.transaction.annotation.Transactional
    public Message sendMessageByEmail(String senderEmail, String receiverEmail, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        if (!isChatAllowed(sender, receiver)) {
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

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Message> getConversationByEmail(String currentUserEmail, String partnerEmail, int page, int size) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User partner = userRepository.findByEmail(partnerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Partner not found"));

        if (!isChatAllowed(currentUser, partner)) {
            throw new IllegalStateException("Chat not allowed");
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        
        List<Message> content = messageRepository.findConversation(
                currentUser,
                partner,
                pageable
        ).getContent();

        List<Message> reversed = new java.util.ArrayList<>();
        for (int i = content.size() - 1; i >= 0; i--) {
            reversed.add(content.get(i));
        }
        return reversed;
    }

    public ChatMessageResponse toChatMessageResponse(Message message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .senderEmail(message.getSender().getEmail())
                .receiverEmail(message.getReceiver().getEmail())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .status(message.getStatus())
                .build();
    }



        public Message markAsSeenByRecipient(Long messageId, String recipientEmail) {
                Message message = messageRepository.findById(messageId)
                                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

                String actualRecipient = message.getReceiver().getEmail();
                if (!actualRecipient.equals(recipientEmail)) {
                        throw new IllegalArgumentException("Only the recipient can mark a message as seen");
                }

                message.setStatus(Message.Status.SEEN);
                return messageRepository.save(message);
        }

        @org.springframework.transaction.annotation.Transactional
        public void deleteMessagesForUserByEmail(String userEmail, Long chatPartnerId) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                User partner = userRepository.findById(chatPartnerId)
                                .orElseThrow(() -> new IllegalArgumentException("Partner not found"));

                messageRepository.softDeleteForSender(user, partner);
                messageRepository.softDeleteForReceiver(user, partner);
        }
}
