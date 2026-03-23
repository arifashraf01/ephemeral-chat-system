package com.arif.chatapp.controller;

import com.arif.chatapp.model.Message;
import com.arif.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

	private final MessageService messageService;
	private final SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/chat.send")
	public Message sendMessage(@Payload Message message) {
		Message saved = messageService.sendMessage(
				message.getSender().getId(),
				message.getReceiver().getId(),
				message.getContent()
		);
		messagingTemplate.convertAndSendToUser(
				String.valueOf(saved.getReceiver().getId()),
				"/queue/messages",
				saved
		);
		return saved;
	}

	@MessageMapping("/chat.typing")
	public void typing(@Payload TypingPayload payload) {
		if (payload == null || payload.getReceiverId() == null) {
			return;
		}
		messagingTemplate.convertAndSendToUser(
				String.valueOf(payload.getReceiverId()),
				"/queue/typing",
				"typing"
		);
	}

	@MessageMapping("/chat.seen")
	public void markSeen(@Payload SeenPayload payload) {
		if (payload == null || payload.getMessageId() == null) {
			return;
		}
		messageService.markAsSeen(payload.getMessageId());
		if (payload.getSenderId() != null) {
			messagingTemplate.convertAndSendToUser(
					String.valueOf(payload.getSenderId()),
					"/queue/seen",
					payload.getMessageId()
			);
		}
	}

	private static class TypingPayload {
		private Long senderId;
		private Long receiverId;

		public Long getSenderId() {
			return senderId;
		}

		public void setSenderId(Long senderId) {
			this.senderId = senderId;
		}

		public Long getReceiverId() {
			return receiverId;
		}

		public void setReceiverId(Long receiverId) {
			this.receiverId = receiverId;
		}
	}

	private static class SeenPayload {
		private Long messageId;
		private Long senderId;

		public Long getMessageId() {
			return messageId;
		}

		public void setMessageId(Long messageId) {
			this.messageId = messageId;
		}

		public Long getSenderId() {
			return senderId;
		}

		public void setSenderId(Long senderId) {
			this.senderId = senderId;
		}
	}
}
