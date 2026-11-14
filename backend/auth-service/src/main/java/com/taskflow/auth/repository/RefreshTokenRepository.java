package com.taskflow.auth.repository;

import com.taskflow.auth.domain.RefreshToken;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update RefreshToken rt set rt.revoked = true, rt.revokedAt = :now where rt.user.id = :userId and rt.revoked = false")
    int revokeAllActiveForUser(@Param("userId") UUID userId, @Param("now") Instant now);

    @Modifying
    @Query("delete from RefreshToken rt where rt.expiresAt < :before")
    int deleteExpired(@Param("before") Instant before);
}
