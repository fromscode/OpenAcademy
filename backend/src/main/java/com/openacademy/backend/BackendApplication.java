package com.openacademy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.openacademy.backend.repository.AdminRepository;
import com.openacademy.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.openacademy.backend.entities.Admin;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
		System.out.println("Hello World");
	}

	@Bean
	@Transactional
	public CommandLineRunner resetAdminPassword(
			UserRepository repo,
			PasswordEncoder encoder,
			AdminRepository adminRepo,
			// Inject values from properties file
			@Value("${security.admin.email}") String adminEmail,
			@Value("${security.admin.password}") String adminPassword) {
		return args -> {
			// Use the injected variable, not a hardcoded string
			User admin = repo.findByEmail(adminEmail).orElse(null);

			if (admin != null) {
				// Encode the password from properties
				admin.setPassword(encoder.encode(adminPassword));
				repo.save(admin);

				System.out.println("------------------------------------------------");
				System.out.println("ADMIN PASSWORD RESET SUCCESSFUL");
				System.out.println("Email: " + adminEmail);
				System.out.println("------------------------------------------------");
			} else {
				System.out.println("!!! ADMIN USER NOT FOUND, CREATING NEW MASTER ADMIN ");
				// 1. Create User
				User user = new User();
				user.setFirstName("Master");
				user.setMiddleName("Head");
				user.setLastName("Admin");
				user.setEmail(adminEmail);
				user.setPhoneNumber("master phone number");
				user.setRole(Role.ADMIN);
				user.setPassword(encoder.encode(adminPassword)); // Remember to encrypt!

				User savedUser = repo.save(user);

				// 2. Create Admin
				Admin newAdmin = new Admin();
				newAdmin.setUser(savedUser);

				adminRepo.save(newAdmin);
				System.out.println("------------------------------------------------");
				System.out.println("NEW MASTER ADMIN CREATED");
				System.out.println("Email: " + adminEmail);
				System.out.println("------------------------------------------------");
			}
		};
	}

}
