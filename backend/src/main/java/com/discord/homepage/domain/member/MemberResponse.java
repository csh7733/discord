package com.discord.homepage.domain.member;

public class MemberResponse {
    private String username;
    private String email;

    public MemberResponse(String username, String email) {
        this.username = username;
        this.email = email;
    }



    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}
