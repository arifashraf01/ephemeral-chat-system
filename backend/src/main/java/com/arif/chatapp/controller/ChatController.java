package com.arif.chatapp.controller;

import com.arif.chatapp.model.Message;
import com.arif.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

	private final MessageService messageService;

	@MessageMapping("/chat.send")
	@SendTo("/topic/messages")
	public Message sendMessage(@Payload Message message) {
		return messageService.sendMessage(
				message.getSender().getId(),
				message.getReceiver().getId(),
				message.getContent()
		);
	}
}
