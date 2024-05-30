package com.discord.homepage.domain.message;

import lombok.Data;

@Data
public class SignalMessage {
    private String type;
    private String from;
    private String to;
    private Object data;
}
