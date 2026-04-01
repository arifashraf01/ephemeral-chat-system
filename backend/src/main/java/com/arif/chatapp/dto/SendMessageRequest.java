package com.arif.chatapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @Email(message = "receiverEmail must be valid")
    @NotBlank(message = "receiverEmail is required")
    private String receiverEmail;

    @NotBlank(message = "content is required")
    private String content;
}
