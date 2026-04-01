package com.arif.chatapp.controller;

import com.arif.chatapp.model.Message;
import com.arif.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

	private final MessageService messageService;
	private final SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/chat.send")
	public Message sendMessage(@Payload ChatMessagePayload payload) {
		if (payload == null || payload.getSenderEmail() == null || payload.getReceiverEmail() == null || payload.getContent() == null) {
			throw new IllegalArgumentException("Invalid chat payload");
		}

		Message saved = messageService.sendMessageByEmail(
				payload.getSenderEmail(),
				payload.getReceiverEmail(),
				payload.getContent()
		);

		messagingTemplate.convertAndSend("/topic/messages/" + payload.getReceiverEmail(), saved);
		messagingTemplate.convertAndSend("/topic/messages/" + payload.getSenderEmail(), saved);
		return saved;
	}

	@MessageMapping("/chat.typing")
	public void typing(@Payload TypingPayload payload) {
		if (payload == null || payload.getReceiverEmail() == null) {
			return;
		}
		messagingTemplate.convertAndSend("/topic/typing/" + payload.getReceiverEmail(), "typing");
	}

	@MessageMapping("/chat.seen")
	public void markSeen(@Payload SeenPayload payload) {
		if (payload == null || payload.getMessageId() == null) {
			return;
		}
		messageService.markAsSeen(payload.getMessageId());
		if (payload.getSenderEmail() != null) {
			messagingTemplate.convertAndSend("/topic/seen/" + payload.getSenderEmail(), payload.getMessageId());
		}
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
		private String senderEmail;

		public Long getMessageId() {
			return messageId;
		}

		public void setMessageId(Long messageId) {
			this.messageId = messageId;
		}

		public String getSenderEmail() {
			return senderEmail;
		}

		public void setSenderEmail(String senderEmail) {
			this.senderEmail = senderEmail;
		}
	}

	private static class ChatMessagePayload {
		private String senderEmail;
		private String receiverEmail;
		private String content;

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
