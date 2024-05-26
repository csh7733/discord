package com.discord.homepage.service.member;


import com.discord.homepage.domain.member.Member;

import java.util.Optional;

public interface MemberService {
    public Member join(Member member);
    public Optional<Member> findMember(String email,String password);
    public Optional<Member> findMemberByUsernameAndEmail(String username, String email);
    public Optional<Member> findMemberByUsername(String username);
    public Optional<Member> findMemberByEmail(String email);
}
