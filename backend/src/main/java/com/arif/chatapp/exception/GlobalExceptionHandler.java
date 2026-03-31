package com.arif.chatapp.exception;

import com.arif.chatapp.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> errors = new HashMap<>();
		for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
			errors.put(fieldError.getField(), fieldError.getDefaultMessage());
		}

		ApiResponse<Object> response = ApiResponse.builder()
				.success(false)
				.message("Validation failed")
				.data(errors)
				.build();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResponse<Object>> handleMalformedJson(HttpMessageNotReadableException ex) {
		ApiResponse<Object> response = ApiResponse.builder()
				.success(false)
				.message("Malformed JSON request body. Expected fields: email, password")
				.data(null)
				.build();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<ApiResponse<Object>> handleRuntime(RuntimeException ex) {
		log.error("Unhandled runtime exception", ex);
		ApiResponse<Object> response = ApiResponse.<Object>builder()
				.success(false)
				.message("Internal server error")
				.data(null)
				.build();
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException ex) {
		ApiResponse<Object> response = ApiResponse.<Object>builder()
				.success(false)
				.message(ex.getMessage())
				.data(null)
				.build();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}
}
