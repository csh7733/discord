package com.discord.homepage.domain.message;

import java.util.Set;

public class Message {
    private String type;
    private String userId;
    private String channelId;
    private Object sdp;
    private Object candidate;
    private Set<String> connectedUsers;

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public Object getSdp() {
        return sdp;
    }

    public void setSdp(Object sdp) {
        this.sdp = sdp;
    }

    public Object getCandidate() {
        return candidate;
    }

    public void setCandidate(Object candidate) {
        this.candidate = candidate;
    }

    public Set<String> getConnectedUsers() {
        return connectedUsers;
    }

    public void setConnectedUsers(Set<String> connectedUsers) {
        this.connectedUsers = connectedUsers;
    }
}
