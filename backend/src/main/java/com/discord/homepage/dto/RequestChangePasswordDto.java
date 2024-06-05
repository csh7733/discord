package com.discord.homepage.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RequestChangePasswordDto {
    private String currentPassword;
    private String newPassword;
    private String confirmNewPassword;
}
