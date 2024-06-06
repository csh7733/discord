package com.discord.homepage.controller.member;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Controller
public class UserOnlineController {

    private final ConcurrentHashMap<String, String> usersMap = new ConcurrentHashMap<>();

    @MessageMapping("/users")
    @SendTo("/topic/users")
    public List<String> getUsers() {
        return usersMap.values().stream().collect(Collectors.toList());
    }

    @MessageMapping("/addUser")
    @SendTo("/topic/users")
    public List<String> addUser(String userName) {
        System.out.println("User added: " + userName);
        usersMap.put(userName, userName);
        return usersMap.values().stream().collect(Collectors.toList());
    }

    @MessageMapping("/removeUser")
    @SendTo("/topic/users")
    public List<String> removeUser(String userName) {
        usersMap.remove(userName);
        return usersMap.values().stream().collect(Collectors.toList());
    }
}