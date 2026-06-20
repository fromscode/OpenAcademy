package com.openacademy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.openacademy.backend.repository.AdminRepository;
import com.openacademy.backend.repository.UserRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
		System.out.println("Hello World");
	}

	@Bean
	public CommandLineRunner resetAdminPassword(
			UserRepository userRepo,
			PasswordEncoder encoder,
			AdminRepository adminRepo,
			AdminInitializer initializer,
			// Inject values from properties file
			@Value("${security.admin.email}") String adminEmail,
			@Value("${security.admin.password}") String adminPassword,
			@Value("${security.admin.force-reset:false}") boolean resetFlag) {
		return args -> {
			// Delegate admin initialization into the Spring-managed transactional service
			initializer.ensureMasterAdmin(adminEmail, adminPassword, resetFlag);
		};
	}

}
