package com.openacademy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.openacademy.backend.repository.UserRepository;
import com.openacademy.backend.entities.User;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
		System.out.println("Hello World");
	}

	@Bean
	public CommandLineRunner resetAdminPassword(UserRepository repo, PasswordEncoder encoder) {
		return args -> {
			// 1. Replace with the email of your MAIN ADMIN account
			String adminEmail = "s@mail.com";

			// 2. Find the user
			User admin = repo.findByEmail(adminEmail).orElse(null);

			if (admin != null) {
				// 3. Set a new temporary password (hashed!)
				admin.setPassword(encoder.encode("abababa"));
				repo.save(admin);

				System.out.println("------------------------------------------------");
				System.out.println("ADMIN PASSWORD RESET SUCCESSFUL");
				System.out.println("Email: " + adminEmail);
				System.out.println("New Password: abababa");
				System.out.println("------------------------------------------------");
			} else {
				System.out.println("!!! ADMIN USER NOT FOUND - CHECK EMAIL !!!");
			}
		};
	}

}
