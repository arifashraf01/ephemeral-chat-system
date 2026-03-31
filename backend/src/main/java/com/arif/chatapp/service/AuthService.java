package com.arif.chatapp.service;

import com.arif.chatapp.model.Otp;
import com.arif.chatapp.model.User;
import com.arif.chatapp.repository.OtpRepository;
import com.arif.chatapp.repository.UserRepository;
import com.arif.chatapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void sendOtp(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            throw new IllegalArgumentException("User already exists");
        });

        String otpCode = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(5));

        Optional<Otp> existing = otpRepository.findByEmail(email);
        Otp otp = existing.orElseGet(Otp::new);
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setExpiresAt(expiresAt);

        otpRepository.save(otp);
    }

    public void verifyOtp(String email, String otp, String password) {
        Otp savedOtp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found"));

        if (!savedOtp.getOtpCode().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        if (savedOtp.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("OTP expired");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setVerified(true);
        userRepository.save(user);

        otpRepository.delete(savedOtp);
    }

    public String login(String email, String password) {
        log.info("Login attempt for email={}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Login failed for email={} due to invalid password", email);
            throw new IllegalArgumentException("Invalid credentials");
        }

        log.info("Login successful for email={}", email);

        return jwtUtil.generateToken(email);
    }
}
