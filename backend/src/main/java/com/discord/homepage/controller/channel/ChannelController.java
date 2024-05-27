package com.discord.homepage.controller.channel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Controller
public class ChannelController {

    private final ConcurrentHashMap<String, Channel> channelsMap = new ConcurrentHashMap<>();

    @MessageMapping("/channels")
    @SendTo("/topic/channels")
    public List<Channel> getChannels() {
        return channelsMap.values().stream()
                .collect(Collectors.toList())
                ;

    }

    @MessageMapping("/addChannel")
    @SendTo("/topic/channels")
    public List<Channel> addChannel(Channel channel) {
        System.out.println("Channel added: " + channel.getName());
        System.out.println("Channel added: " + channel.getKey());
        channelsMap.put(channel.getKey(), channel);
        return channelsMap.values().stream().collect(Collectors.toList());
    }

    @MessageMapping("/updateChannel")
    @SendTo("/topic/channels")
    public List<Channel> updateChannel(Channel channel) {
        System.out.println("Channel updated: " + channel.getName());
        channelsMap.put(channel.getKey(), channel);
        return channelsMap.values().stream().collect(Collectors.toList());
    }

    @MessageMapping("/removeChannel")
    @SendTo("/topic/channels")
    public List<Channel> removeChannel(String channelKey) {
        System.out.println("Channel removed: " + channelKey);
        channelsMap.remove(channelKey);
        return channelsMap.values().stream().collect(Collectors.toList());
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Channel {

        private Long id;

        private String key;
        private String name;
        private String type; // "chat" or "voice"


        // Constructors, getters, and setters


    }
}
