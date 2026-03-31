package com.arif.chatapp.controller;

import com.arif.chatapp.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    public void sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request.getEmail());
    }

    @PostMapping("/verify-otp")
    public void verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request.getEmail(), request.getOtp(), request.getPassword());
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {
        log.debug("Login request received DTO: email='{}', passwordLength={}", request.getEmail(),
                request.getPassword() == null ? 0 : request.getPassword().length());
        return authService.login(request.getEmail(), request.getPassword());
    }

    /**
     * Temporary debug helper to verify request binding without DTO validation.
     * Send JSON: { "email": "...", "password": "..." }
     */
    @PostMapping("/login-debug")
    public String loginDebug(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        log.debug("Login DEBUG body: {}", body);
        if (email == null || password == null) {
            throw new IllegalArgumentException("Missing email or password");
        }
        return authService.login(email, password);
    }

    @Data
    private static class SendOtpRequest {
        @Email
        @NotBlank
        private String email;
    }

    @Data
    private static class VerifyOtpRequest {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String otp;

        @NotBlank
        private String password;
    }

    @Data
    private static class LoginRequest {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String password;
    }
}
