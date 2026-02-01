package com.openacademy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Optional;
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
			@Value("${security.admin.password}") String adminPassword,
			@Value("${security.admin.force-reset:false}") boolean resetFlag) {
		return args -> {

			// if reset flag is on then we have to reset the master admin's password
			// this is a fallback method if we forget the master admin's password
			if (resetFlag) {
				System.out.println("----- FORCE RESET MODE ENABLED -----");
				Optional<User> existingUser = userRepo.findByEmail(adminEmail);

				// if the admin email doesnot exists, then we simply create a new master admin
				if (existingUser.isEmpty()) {
					System.out.println("----- NO USER FOUND WITH THE SPECIFIED EMAIL -----");
					System.out.println("----- CREATING NEW ADMIN -----");

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

					adminRepo.save(newAdmin);

					System.out.println("----- NEW ADMIN CREATED SUCCESSFULLY -----");
					System.out.println("Admin Email: " + adminEmail);

				}
				// if the email exists, but is used by a user that is not an admin
				// this scenario is rare but can happen if the emails have been changed
				else if (existingUser.get().getRole() != Role.ADMIN) {
					System.out.println("----- THE EMAIL PROVIDED BELONGS TO A USER THAT IS NOT AN ADMIN -----");
					System.out.println("----- IT IS RECOMMENDED TO CHANGE THE EMAIL AND TRY AGAIN -----");
					return;
				} else {
					System.out.println("----- ADMIN USER FOUND, RESETTING PASSWORD -----");
					User user = existingUser.get();
					user.setPassword(encoder.encode(adminPassword));

					userRepo.save(user);

					System.out.println("----- ADMIN PASSWORD RESETTED SUCCESFULLY -----");
				}

				return;
			}

			// if db doesnot have a single admin, then create a master admin with the env
			// variables
			if (userRepo.countByRole(Role.ADMIN) == 0) {
				System.out.println("----- 0 ADMIN USERS FOUND, CREATING NEW MASTER ADMIN -----");
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
				System.out.println("----- DB CONTAINS AT LEAST ONE ADMIN -----");
				System.out.println("----- SKIPPING ADMIN INITIALIZATION -----");
			}
		};
	}

}
