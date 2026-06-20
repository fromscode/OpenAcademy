package com.openacademy.backend;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.openacademy.backend.entities.Admin;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.entities.common.Role;
import com.openacademy.backend.repository.AdminRepository;
import com.openacademy.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminInitializer {

  private final UserRepository userRepo;
  private final AdminRepository adminRepo;
  private final PasswordEncoder encoder;

  @Transactional
  public void ensureMasterAdmin(String adminEmail, String adminPassword, boolean resetFlag) {
    // if reset flag is on then we have to reset the master admin's password
    if (resetFlag) {
      System.out.println("----- FORCE RESET MODE ENABLED -----");
      Optional<User> existingUser = userRepo.findByEmail(adminEmail);

      // if the admin email does not exist, then create a new master admin
      if (existingUser.isEmpty()) {
        System.out.println("----- NO USER FOUND WITH THE SPECIFIED EMAIL -----");
        System.out.println("----- CREATING NEW ADMIN -----");

        User user = new User();
        user.setFirstName("Master");
        user.setLastName("Admin");
        user.setEmail(adminEmail);
        user.setPhoneNumber(adminEmail);
        user.setRole(Role.ADMIN);
        user.setPassword(encoder.encode(adminPassword));

        User savedUser = userRepo.save(user);

        Admin newAdmin = new Admin();
        newAdmin.setUser(savedUser);
        adminRepo.save(newAdmin);

        System.out.println("----- NEW ADMIN CREATED SUCCESSFULLY -----");
        System.out.println("Admin Email: " + adminEmail);
        return;
      }

      // if the email exists, but belongs to a user that is not an admin
      if (existingUser.get().getRole() != Role.ADMIN) {
        System.out.println("----- THE EMAIL PROVIDED BELONGS TO A USER THAT IS NOT AN ADMIN -----");
        System.out.println("----- NOT CREATING ADMIN. CHANGE EMAIL OR ROLE AND TRY AGAIN -----");
        return;
      }

      // else reset password
      System.out.println("----- ADMIN USER FOUND, RESETTING PASSWORD -----");
      User user = existingUser.get();
      user.setPassword(encoder.encode(adminPassword));
      userRepo.save(user);
      System.out.println("----- ADMIN PASSWORD RESET SUCCESSFULLY -----");
      return;
    }

    // if db does not have a single admin, then create a master admin
    if (userRepo.countByRole(Role.ADMIN) == 0) {
      System.out.println("----- 0 ADMIN USERS FOUND, CREATING NEW MASTER ADMIN -----");
      User user = new User();
      user.setFirstName("Master");
      user.setLastName("Admin");
      user.setEmail(adminEmail);
      user.setPhoneNumber(adminEmail);
      user.setRole(Role.ADMIN);
      user.setPassword(encoder.encode(adminPassword));

      User savedUser = userRepo.save(user);

      Admin newAdmin = new Admin();
      newAdmin.setUser(savedUser);
      adminRepo.save(newAdmin);

      System.out.println("----- MASTER ADMIN CREATED SUCCESSFULLY -----");
      System.out.println("Admin Email: " + adminEmail);
    } else {
      System.out.println("----- DB CONTAINS AT LEAST ONE ADMIN -----");
      System.out.println("----- SKIPPING ADMIN INITIALIZATION -----");
    }
  }
}
