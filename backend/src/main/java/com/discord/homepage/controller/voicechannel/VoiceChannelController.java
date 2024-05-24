package com.discord.homepage.controller.voicechannel;

import com.discord.homepage.domain.member.Member;
import com.discord.homepage.service.voicechannel.VoiceChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.util.List;

@RestController
@RequestMapping("/api/voice-channel")
public class VoiceChannelController {
    @Autowired
    private VoiceChannelService voiceChannelService;

    @GetMapping("/{channelId}/members")
    public ResponseEntity<List<Member>> getMembers(@PathVariable Long channelId) {
        List<Member> members = voiceChannelService.getUsersByChannelId(channelId);
        return ResponseEntity.ok(members);
    }

    // Other endpoints for managing voice channels and users
}
