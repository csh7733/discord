package com.discord.homepage.controller.chat;

import com.discord.homepage.domain.chat.Chat;
import com.discord.homepage.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/channels")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/{channelId}")
    public List<Chat> getChatsByChannel(@PathVariable Integer channelId) {
        return chatService.findByChatChannelId(channelId);
    }
    
    @MessageMapping("/channel/{channelId}")
    @SendTo("/topic/channel/{channelId}")
    public Chat sendMessage(@DestinationVariable Integer channelId, Chat chat) {
        chat.setChatChannelId(channelId);
        return chatService.save(chat);
    }
}
