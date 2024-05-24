package com.discord.homepage.controller.signal;

import com.discord.homepage.domain.signalmessage.SignalMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {

    @MessageMapping("/call")
    @SendTo("/topic/call")
    public SignalMessage call(SignalMessage message) {
        return message;
    }

    @MessageMapping("/answer")
    @SendTo("/topic/answer")
    public SignalMessage answer(SignalMessage message) {
        return message;
    }

    @MessageMapping("/candidate")
    @SendTo("/topic/candidate")
    public SignalMessage candidate(SignalMessage message) {
        return message;
    }
}
