package com.transport.tms.service;

import com.transport.tms.dto.AuthResponse;
import com.transport.tms.model.User;
import com.transport.tms.model.UserRole;
import com.transport.tms.repository.UserRepository;
import com.transport.tms.security.CustomUserDetails;
import com.transport.tms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(User user, String plainPassword) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(plainPassword));

        // Set default role if not provided
        if (user.getRole() == null) {
            user.setRole(UserRole.CUSTOMER);
        }

        // Ensure user is active
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }

        user = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        // Remove password from response (entity is detached after save)
        user.setPassword(null);

        return new AuthResponse(token, user);
    }

    @Deprecated
    public AuthResponse register(String email, String password, String firstName,
                                 String lastName, UserRole role, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists with email: " + email);
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role != null ? role : UserRole.CUSTOMER);
        user.setPhone(phone);
        user.setIsActive(true);

        user = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        // Remove password from response (entity is detached after save)
        user.setPassword(null);

        return new AuthResponse(token, user);
    }

    public AuthResponse login(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        User user = userDetails.getUser();
        // Remove password from response
        user.setPassword(null);

        return new AuthResponse(token, user);
    }

    public User getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(null);
        return user;
    }
}
