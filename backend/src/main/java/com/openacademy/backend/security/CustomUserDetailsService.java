package com.openacademy.backend.security;

import com.openacademy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public CustomUserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // We use the repository you provided earlier
        return userRepository.findByEmail(email)
                .map(CustomUserDetails::new) // Wrap the found user
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}