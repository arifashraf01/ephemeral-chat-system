package com.arif.chatapp.controller;

import com.arif.chatapp.dto.ChatMessagePayload;
import com.arif.chatapp.dto.ChatMessageResponse;
import com.arif.chatapp.dto.SeenPayload;
import com.arif.chatapp.dto.TypingPayload;
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

}
