package com.discord.homepage.service.chat;

import com.discord.homepage.domain.chat.Chat;
import com.discord.homepage.domain.member.Member;
import com.discord.homepage.repository.chat.ChatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChatService {

    private final ChatRepository chatRepository;

    public Chat save(Chat chat) {
        return chatRepository.save(chat);
    }

    public List<Chat> findByChatChannelId(Integer chatChannelId){
        return chatRepository.findByChatChannelId(chatChannelId);
    }
}
