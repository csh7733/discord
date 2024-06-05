package com.discord.homepage.repository.member;

import com.discord.homepage.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member,Long> {
    Optional<Member> findByEmailAndPassword(String email, String password);
    Optional<Member> findByUsernameAndEmail(String username, String email);
    Optional<Member> findByUsername(String username);
    Optional<Member> findByEmail(String email);
    Optional<Member> findByPassword(String password);

    @Modifying
    @Query("UPDATE Member m SET m.password = :newPassword WHERE m.email = :email AND m.password = :currentPassword")
    int updatePassword(@Param("email") String email, @Param("currentPassword") String currentPassword, @Param("newPassword") String newPassword);

}
