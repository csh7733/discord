package com.discord.homepage.controller.member;

import com.discord.homepage.domain.member.MemberResponse;
import com.discord.homepage.dto.MemberDto;
import com.discord.homepage.service.userDetail.MyUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
public class MemberController {
    @GetMapping("/member")
    public ResponseEntity<MemberResponse> getMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        MyUserDetails currentUser = (MyUserDetails)  authentication.getPrincipal();

        MemberResponse memberResponse = new MemberResponse(currentUser.getUsername(), currentUser.getEmail());

        return ResponseEntity.ok(memberResponse);
    }


}
