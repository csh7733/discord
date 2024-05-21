package com.discord.homepage.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RequestRegisterDto {
    private String userName;
    private String email;
    private String password;
}
