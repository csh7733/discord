package com.discord.homepage.service.voicechannel;

import com.discord.homepage.domain.member.Member;
import com.discord.homepage.repository.member.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoiceChannelService {
    @Autowired
    private MemberRepository memberRepository;

    public List<Member> getUsersByChannelId(Long channelId) {
        return memberRepository.findByVoiceChannelId(channelId);
    }

    // Other service methods for managing voice channels and users
}