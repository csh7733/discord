package com.discord.homepage.domain.member;

import com.discord.homepage.domain.voicechannel.VoiceChannel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String email;
    private String password;

    @ManyToOne
    @JoinColumn(name = "voice_channel_id")
    private VoiceChannel voiceChannel;

    public Member(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

}
