package com.medibook.repository;

import com.medibook.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByOtpAndOtpTypeAndIsUsedFalse(
        String otp, OtpToken.OtpType otpType);
    void deleteByUserId(Long userId);
}
