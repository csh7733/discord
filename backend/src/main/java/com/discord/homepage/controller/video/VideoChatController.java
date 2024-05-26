package com.discord.homepage.controller.video;

import com.discord.homepage.domain.message.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class VideoChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConcurrentHashMap<String, Set<String>> connectedUsersMap = new ConcurrentHashMap<>();

    public VideoChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/channel/{channelId}/join")
    public void handleJoin(@Payload Message message) {
        String channelId = message.getChannelId();
        connectedUsersMap.putIfAbsent(channelId, new HashSet<>());
        connectedUsersMap.get(channelId).add(message.getUserId());

        message.setType("JOIN");
        message.setConnectedUsers(connectedUsersMap.get(channelId));
        System.out.println("Sending join message to channel: " + channelId);

        messagingTemplate.convertAndSend("/topic/channel/" + channelId, message);
    }

    @MessageMapping("/channel/{channelId}/leave")
    public void handleLeave(@Payload Message message) {
        String channelId = message.getChannelId();
        if (connectedUsersMap.containsKey(channelId)) {
            connectedUsersMap.get(channelId).remove(message.getUserId());
            if (connectedUsersMap.get(channelId).isEmpty()) {
                connectedUsersMap.remove(channelId);
            }
        }

        message.setType("LEAVE");
        message.setConnectedUsers(connectedUsersMap.getOrDefault(channelId, new HashSet<>()));
        System.out.println("Sending leave message to channel: " + channelId);

        messagingTemplate.convertAndSend("/topic/channel/" + channelId, message);
    }

    @MessageMapping("/channel/{channelId}/sdp")
    public void handleSDP(@Payload Message message) {
        System.out.println("SDP received from: " + message.getUserId() + " for channel: " + message.getChannelId());
        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannelId(), message);
    }

    @MessageMapping("/channel/{channelId}/ice-candidate")
    public void handleIceCandidate(@Payload Message message) {
        System.out.println("ICE candidate received from: " + message.getUserId() + " for channel: " + message.getChannelId());
        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannelId(), message);
    }
}
