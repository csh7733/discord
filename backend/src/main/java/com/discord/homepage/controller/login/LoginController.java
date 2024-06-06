package com.discord.homepage.controller.login;

import com.discord.homepage.domain.member.Member;
import com.discord.homepage.dto.RequestFindPasswordDto;
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

    @PostMapping("/sessions")
    public ResponseEntity<String> login(@RequestBody RequestLoginDto requestLoginDto) {
        Optional<Member> findMember = memberService.findMemberByEmail(requestLoginDto.getEmail());
        if (findMember.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User with this email not found");
        }
        log.info(findMember.get().toString());
        // 아이디 비밀번호 확인
        findMember = memberService.findMember(requestLoginDto.getEmail(), requestLoginDto.getPassword());
        if (findMember.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Password error");
        }

        Member member = findMember.get();
        String jwt = JwtUtil.generateToken(member.getUsername(), member.getEmail());

        return ResponseEntity.ok(jwt);
    }

    @PostMapping("/users")
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

    @PostMapping("/password-find")
    public ResponseEntity<String> findPassword(@RequestBody RequestFindPasswordDto requestFindPasswordDto) {
        Optional<Member> findMember = memberService.findMemberByUsernameAndEmail(
                requestFindPasswordDto.getUsername(), requestFindPasswordDto.getEmail());

        if (findMember.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with the provided information");
        }

        String password = findMember.get().getPassword();
        String maskedPassword = maskPassword(password);
        return ResponseEntity.ok(maskedPassword);
    }

    private String maskPassword(String password) {
        if (password.length() <= 4) {
            return password + "****";
        }
        return password.substring(0, 4) + "****";
    }
}
