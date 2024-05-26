// src/main/java/com/discord/homepage/controller/VideoController.java
package com.discord.homepage.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

@Controller
public class VideoController {

    @MessageMapping("/video")
    @SendTo("/topic/video")
    public byte[] handleVideo(@Payload byte[] video, SimpMessageHeaderAccessor headerAccessor) {
        return video;
    }
}
