package com.openacademy.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Early exit: If there is no auth header or it doesn't start with "Bearer ",
        // pass it on.
        // This allows the request to reach the "public" endpoints (like login/register)
        // defined in SecurityConfig.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract the token (Remove "Bearer " prefix)
        jwt = authHeader.substring(7);

        // 3. Extract the email from the token
        userEmail = jwtService.extractUsername(jwt);

        // 4. If email exists and user is not already authenticated in this context...
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 5. Load user details from database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 6. Validate token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // 7. Create Auth Token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                // 8. Enforce details (IP address, Session ID, etc.)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // 9. Update Security Context (This is the moment the user is "logged in")
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 10. Continue the filter chain
        filterChain.doFilter(request, response);
    }
}