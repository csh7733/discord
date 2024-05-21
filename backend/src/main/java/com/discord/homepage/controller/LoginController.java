package com.discord.homepage.controller;

import com.discord.homepage.domain.member.Member;
import com.discord.homepage.dto.RequestLoginDto;
import com.discord.homepage.dto.RequestRegisterDto;
import com.discord.homepage.jwt.JwtUtil;
import com.discord.homepage.service.member.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
public class LoginController {

    private final MemberService memberService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody RequestLoginDto requestLoginDto) {
        //아이디 비밀번호 확인
        Optional<Member> findMember = memberService.findMember(requestLoginDto.getEmail(), requestLoginDto.getPassword());
        if(findMember.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        Member member = findMember.get();
        String jwt = JwtUtil.generateToken(member.getUsername(),member.getEmail());

        return ResponseEntity.ok(jwt);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RequestRegisterDto requestRegisterDto) {
        Optional<Member> findMember = memberService.findMemberByEmail(requestRegisterDto.getEmail());
        // 이메일 중복 확인
        if (findMember.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }
        // 유저 생성
        Member member = new Member(requestRegisterDto.getUserName(),requestRegisterDto.getEmail(),requestRegisterDto.getPassword());
        // 계정 생성
        memberService.join(member);
        return ResponseEntity.ok("ok");
    }
}
