package com.discord.homepage.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class SignalingHandler extends TextWebSocketHandler {

    private final Map<String, Map<String, WebSocketSession>> channelSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String channelId = getChannelIdFromSession(session);
        channelSessions.computeIfAbsent(channelId, k -> new ConcurrentHashMap<>()).put(session.getId(), session);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of("type", "setSessionId", "sessionId", session.getId()))));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type = (String) payload.get("type");
        String targetSessionId = (String) payload.get("target");

        Object channelIdObj = payload.get("channelId");
        String channelId = null;
        if (channelIdObj instanceof Integer) {
            channelId = String.valueOf(channelIdObj);
        } else if (channelIdObj instanceof String) {
            channelId = (String) channelIdObj;
        }

        Map<String, WebSocketSession> sessions = channelSessions.get(channelId);

        if (sessions != null) {
            WebSocketSession targetSession = sessions.get(targetSessionId);

            if (targetSession != null && targetSession.isOpen()) {
                sendMessageWithRetry(targetSession, message);
            } else {
                for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
                    if (!entry.getKey().equals(session.getId()) && entry.getValue().isOpen()) {
                        sendMessageWithRetry(entry.getValue(), message);
                    }
                }
            }
        }
    }

    private void sendMessageWithRetry(WebSocketSession session, TextMessage message) {
        try {
            session.sendMessage(message);
        } catch (IllegalStateException e) {
            if (e.getMessage().contains("TEXT_PARTIAL_WRITING")) {
                try {
                    log.info("retry");
                    Thread.sleep(50); // 50ms 대기 후 재시도
                    session.sendMessage(message);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            } else {
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String channelId = getChannelIdFromSession(session);
        Map<String, WebSocketSession> sessions = channelSessions.get(channelId);

        if (sessions != null) {
            sessions.remove(session.getId());
            if (sessions.isEmpty()) {
                channelSessions.remove(channelId);
            }
        }
    }

    private String getChannelIdFromSession(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null && query.startsWith("channelId=")) {
            return query.substring("channelId=".length());
        }
        return "default";
    }
}
