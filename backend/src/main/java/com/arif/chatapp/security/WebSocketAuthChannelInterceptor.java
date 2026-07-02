package com.arif.chatapp.security;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Authorization header is required for WebSocket connection");
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                throw new IllegalArgumentException("Invalid or expired WebSocket token");
            }

            String email = jwtUtil.getSubject(token);
            Principal principal = new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
            accessor.setUser(principal);
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            Principal principal = accessor.getUser();
            
            if (destination != null && (destination.startsWith("/topic/messages/") || destination.startsWith("/topic/typing/") || destination.startsWith("/topic/seen/"))) {
                if (principal == null || principal.getName() == null) {
                    throw new IllegalArgumentException("Unauthenticated subscription attempt");
                }
                
                String expectedPrefix1 = "/topic/messages/" + principal.getName();
                String expectedPrefix2 = "/topic/typing/" + principal.getName();
                String expectedPrefix3 = "/topic/seen/" + principal.getName();
                
                if (!destination.equals(expectedPrefix1) && !destination.equals(expectedPrefix2) && !destination.equals(expectedPrefix3)) {
                    throw new IllegalArgumentException("Unauthorized subscription destination");
                }
            }
        }

        return message;


    }
}