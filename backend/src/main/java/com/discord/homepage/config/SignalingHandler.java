package com.discord.homepage.config;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class SignalingHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new HashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of("type", "setSessionId", "sessionId", session.getId()))));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type = (String) payload.get("type");
        String targetSessionId = (String) payload.get("target");

        WebSocketSession targetSession = sessions.get(targetSessionId);

        if (targetSession != null && targetSession.isOpen()) {
            targetSession.sendMessage(message);
        } else {
            // Broadcast to all sessions except the sender
            for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
                if (!entry.getKey().equals(session.getId()) && entry.getValue().isOpen()) {
                      entry.getValue().sendMessage(message);
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
    }
}
