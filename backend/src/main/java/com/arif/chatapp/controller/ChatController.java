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
}
