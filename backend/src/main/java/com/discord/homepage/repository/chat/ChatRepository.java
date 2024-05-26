package com.discord.homepage.repository.chat;


import com.discord.homepage.domain.chat.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByChatChannelId(Integer chatChannelId);
}
