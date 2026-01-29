package com.openacademy.backend.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.openacademy.backend.entities.User;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    // 1. Map your Role to a GrantedAuthority
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(user.getRole().name()));
    }

    // 2. Map your password
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    // 3. Map your email to the "username" field
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    // 4. Boilerplate for account status (modify if you add these fields later)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Helper to get the underlying User object if needed later
    public User getUser() {
        return user;
    }
}
