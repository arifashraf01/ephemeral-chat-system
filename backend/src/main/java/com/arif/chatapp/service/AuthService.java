package com.arif.chatapp.service;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    public void sendOtp(String email) {
        // TODO: implement OTP generation and dispatch
    }

    public void verifyOtp(String email, String otp) {
        // TODO: implement OTP validation flow
    }

    public String login(String email, String password) {
        // TODO: implement authentication and token issuance
        return null;
    }
}
