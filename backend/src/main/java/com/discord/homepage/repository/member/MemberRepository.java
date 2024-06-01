package com.discord.homepage.repository.member;

import com.discord.homepage.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member,Long> {
    Optional<Member> findByEmailAndPassword(String email, String password);
    Optional<Member> findByUsernameAndEmail(String username, String email);
    Optional<Member> findByUsername(String username);
    Optional<Member> findByEmail(String email);

}
