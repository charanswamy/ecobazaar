package com.ecobazaar.ecobazaar.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecobazaar.ecobazaar.dto.LoginRequest;
import com.ecobazaar.ecobazaar.dto.RegisterRequest;
import com.ecobazaar.ecobazaar.dto.UserResponse;
import com.ecobazaar.ecobazaar.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	
	private final AuthService authService;
	
	public AuthController(AuthService authService) {
		this.authService = authService;
	}
	
	//testing
	@PostMapping("/register")
	public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest register){
		return ResponseEntity.ok(authService.register(register));
	}
	
	@PostMapping("/login")
	public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest login){
		return ResponseEntity.ok(authService.login(login));
	}

}
