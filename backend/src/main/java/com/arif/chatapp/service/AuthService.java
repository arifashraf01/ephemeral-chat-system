package com.arif.chatapp.service;

import com.arif.chatapp.model.Otp;
import com.arif.chatapp.repository.OtpRepository;
import com.arif.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;

    public void sendOtp(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String otpCode = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(5));

        Optional<Otp> existing = otpRepository.findByEmail(email);
        Otp otp = existing.orElseGet(Otp::new);
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setExpiresAt(expiresAt);

        otpRepository.save(otp);
    }

    public void verifyOtp(String email, String otp) {
        // TODO: implement OTP validation flow
    }

    public String login(String email, String password) {
        // TODO: implement authentication and token issuance
        return null;
    }
}
