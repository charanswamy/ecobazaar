package com.ecobazaar.ecobazaar.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.ecobazaar.ecobazaar.model.User;
import com.ecobazaar.ecobazaar.repository.UserRepository;

// commit

// edit commit
@Configuration
public class DataLoader {
	
	@Bean
	CommandLineRunner loadData(UserRepository userRepository, PasswordEncoder encoder) {
		return args->{
			if(userRepository.findByEmail("admin@ecobazaar.com").isEmpty()) {
				User admin = new User();
				admin.setName("Default_Admin");
				admin.setEmail("admin@ecobazaar.com");
				admin.setPassword(encoder.encode("Admin@123"));
				admin.setRole("ROLE_ADMIN");
				admin.setEcoScore(0);
				userRepository.save(admin);
				
				System.out.println("Admin Created Successfully: admin@ecobazaar.com/Admin@123");
			
			}else {
				System.out.println("Admin user already exists");
			}
		};
	}

}