package com.arif.chatapp.exception;

import com.arif.chatapp.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<ApiResponse<Object>> handleRuntime(RuntimeException ex) {
		ApiResponse<Object> response = ApiResponse.<Object>builder()
				.success(false)
				.message(ex.getMessage())
				.data(null)
				.build();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}
}
