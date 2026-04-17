package com.arif.chatapp.controller;

import com.arif.chatapp.dto.ChatMessageResponse;
import com.arif.chatapp.model.Message;
import com.arif.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

	private final MessageService messageService;
	private final SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/chat.send")
	public ChatMessageResponse sendMessage(@Payload ChatMessagePayload payload, Principal principal) {
		if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
			throw new IllegalArgumentException("WebSocket authentication is required");
		}

		if (payload == null || payload.getReceiverEmail() == null || payload.getContent() == null) {
			throw new IllegalArgumentException("Invalid chat payload");
		}

		Message saved = messageService.sendMessageByEmail(
				principal.getName(),
				payload.getReceiverEmail(),
				payload.getContent()
		);
		ChatMessageResponse response = messageService.toChatMessageResponse(saved);

		messagingTemplate.convertAndSend("/topic/messages/" + payload.getReceiverEmail(), response);
		messagingTemplate.convertAndSend("/topic/messages/" + principal.getName(), response);
		return response;
	}

	@MessageMapping("/chat.typing")
	public void typing(@Payload TypingPayload payload, Principal principal) {
		if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
			return;
		}
		if (payload == null || payload.getReceiverEmail() == null) {
			return;
		}
		messagingTemplate.convertAndSend("/topic/typing/" + payload.getReceiverEmail(), "typing");
	}

	@MessageMapping("/chat.seen")
	public void markSeen(@Payload SeenPayload payload, Principal principal) {
		if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
			return;
		}
		if (payload == null || payload.getMessageId() == null) {
			return;
		}

		Message updated = messageService.markAsSeenByRecipient(payload.getMessageId(), principal.getName());
		messagingTemplate.convertAndSend("/topic/seen/" + updated.getSender().getEmail(), payload.getMessageId());
	}

	@MessageMapping("/chat.open")
	public void openChat(@Payload ChatSessionPayload payload) {
		if (payload == null || payload.getUserId() == null || payload.getPartnerId() == null) {
			return;
		}
		log.info("Chat opened between {} and {}", payload.getUserId(), payload.getPartnerId());
	}

	@MessageMapping("/chat.close")
	public void closeChat(@Payload ChatSessionPayload payload) {
		if (payload == null || payload.getUserId() == null || payload.getPartnerId() == null) {
			return;
		}
		messageService.deleteMessagesForUser(payload.getUserId(), payload.getPartnerId());
	}

	private static class TypingPayload {
		private String senderEmail;
		private String receiverEmail;

		public String getSenderEmail() {
			return senderEmail;
		}

		public void setSenderEmail(String senderEmail) {
			this.senderEmail = senderEmail;
		}

		public String getReceiverEmail() {
			return receiverEmail;
		}

		public void setReceiverEmail(String receiverEmail) {
			this.receiverEmail = receiverEmail;
		}
	}

	private static class SeenPayload {
		private Long messageId;

		public Long getMessageId() {
			return messageId;
		}

		public void setMessageId(Long messageId) {
			this.messageId = messageId;
		}
	}

	private static class ChatMessagePayload {
		private String receiverEmail;
		private String content;

		public String getReceiverEmail() {
			return receiverEmail;
		}

		public void setReceiverEmail(String receiverEmail) {
			this.receiverEmail = receiverEmail;
		}

		public String getContent() {
			return content;
		}

		public void setContent(String content) {
			this.content = content;
		}
	}

	private static class ChatSessionPayload {
		private Long userId;
		private Long partnerId;

		public Long getUserId() {
			return userId;
		}

		public void setUserId(Long userId) {
			this.userId = userId;
		}

		public Long getPartnerId() {
			return partnerId;
		}

		public void setPartnerId(Long partnerId) {
			this.partnerId = partnerId;
		}
	}
}
