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
			UserRepository userRepo,
			PasswordEncoder encoder,
			AdminRepository adminRepo,
			// Inject values from properties file
			@Value("${security.admin.email}") String adminEmail,
			@Value("${security.admin.password}") String adminPassword) {
		return args -> {

			// if db doesnot have a single admin, then create a master admin with the env
			// variables
			if (userRepo.countByRole(Role.ADMIN) == 0) {
				System.out.println("!!! 0 ADMIN USERS FOUND, CREATING NEW MASTER ADMIN ");
				User user = new User();
				user.setFirstName("Master");
				user.setLastName("Admin");
				user.setEmail(adminEmail);
				user.setPhoneNumber(adminEmail); // since phone number is not provided, we use email here
				user.setRole(Role.ADMIN);
				user.setPassword(encoder.encode(adminPassword)); // Remember to encrypt!

				User savedUser = userRepo.save(user);

				// 2. Create Admin
				Admin newAdmin = new Admin();
				newAdmin.setUser(savedUser);
			} else {
				System.out.println("DB contains at least one ADMIN");
				System.out.println("Skipping admin initialization");
			}
		};
	}

}
