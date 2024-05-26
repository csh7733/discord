package com.discord.homepage.service.member;

import com.discord.homepage.domain.member.Member;
import com.discord.homepage.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MemberServiceImpl implements MemberService{

    private final MemberRepository memberRepository;
    @Override
    public Member join(Member member) {
        return memberRepository.save(member);
    }

    @Override
    public Optional<Member> findMember(String email, String password) {
        return memberRepository.findByEmailAndPassword(email, password);
    }

    @Override
    public Optional<Member> findMemberByUsernameAndEmail(String username, String email) {
        return memberRepository.findByUsernameAndEmail(username,email);
    }

    @Override
    public Optional<Member> findMemberByUsername(String username) {
        return memberRepository.findByUsername(username);
    }

    @Override
    public Optional<Member> findMemberByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

}
