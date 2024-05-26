package com.discord.homepage.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RequestFindPasswordDto {
    private String username;
    private String email;
}
