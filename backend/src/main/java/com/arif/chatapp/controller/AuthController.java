package com.arif.chatapp.controller;

import com.arif.chatapp.dto.LoginRequest;
import com.arif.chatapp.dto.SendOtpRequest;
import com.arif.chatapp.dto.VerifyOtpRequest;
import com.arif.chatapp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

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

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received: email='{}'", request.getEmail());
        String token = authService.login(request.getEmail(), request.getPassword());
        return java.util.Map.of("token", token);
    }

}
