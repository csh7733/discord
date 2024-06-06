package com.discord.homepage.controller.member;

import com.discord.homepage.domain.member.Member;
import com.discord.homepage.dto.RequestChangePasswordDto;
import com.discord.homepage.service.member.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
public class UserController {

    private final MemberService memberService;

    @GetMapping("/users/me")
    public ResponseEntity<String> getMember() {
        UserDetails currentMember = getCurrentMember();
        return ResponseEntity.ok(currentMember.getUsername());
    }

    private static UserDetails getCurrentMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails currentUser = (UserDetails)  authentication.getPrincipal();
        return currentUser;
    }

    @PutMapping("/users/me/password")
    public ResponseEntity<String> changePassword(@RequestBody RequestChangePasswordDto requestChangePasswordDto) {
        String currentPassword = requestChangePasswordDto.getCurrentPassword();
        String newPassword = requestChangePasswordDto.getNewPassword();
        String confirmNewPassword = requestChangePasswordDto.getConfirmNewPassword();

        String username = getCurrentMember().getUsername();

        Optional<Member> currentMember = memberService.findMemberByUsername(username);
        String email = currentMember.get().getEmail();

        Optional<Member> findMember = memberService.findMember(email,currentPassword);
        if (findMember.isEmpty()) {
            return ResponseEntity.status(400).body("Current password is incorrect");
        }
        if(!newPassword.equals(confirmNewPassword)){
            return ResponseEntity.status(400).body("New passwords do not match");
        }
        if (currentPassword.equals(newPassword)) {
            return ResponseEntity.status(400).body("Current password and new password are the same");
        }
        memberService.changePassword(email,currentPassword,newPassword);

        return ResponseEntity.ok("Password changed successfully");
    }

    @DeleteMapping("/users/me")
    public ResponseEntity<String> deleteAccount() {

        String username = getCurrentMember().getUsername();
        memberService.deleteByUsername(username);

        return ResponseEntity.ok("Delete Account Success!");
    }
}
