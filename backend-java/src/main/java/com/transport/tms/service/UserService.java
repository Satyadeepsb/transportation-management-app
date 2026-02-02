package com.transport.tms.service;

import com.transport.tms.dto.PaginatedUsers;
import com.transport.tms.dto.PaginationMeta;
import com.transport.tms.model.User;
import com.transport.tms.model.UserRole;
import com.transport.tms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public PaginatedUsers findAll(UserRole role, Boolean isActive, String search,
                                  Integer page, Integer limit, String sortBy, String sortOrder) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        Pageable pageable = PageRequest.of(page - 1, limit, sort);

        // Simple filtering - in production, use Specifications for complex queries
        Page<User> userPage;
        if (role != null) {
            userPage = userRepository.findAll((root, query, cb) -> cb.equal(root.get("role"), role), pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        // Remove passwords from all users
        userPage.getContent().forEach(user -> user.setPassword(null));

        // Create pagination metadata
        PaginationMeta meta = new PaginationMeta(
                (int) userPage.getTotalElements(),
                page,
                limit,
                userPage.getTotalPages(),
                userPage.hasNext(),
                userPage.hasPrevious()
        );

        return new PaginatedUsers(userPage.getContent(), meta);
    }

    public User findById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setPassword(null);
        return user;
    }

    public List<User> findDrivers() {
        List<User> drivers = userRepository.findByRole(UserRole.DRIVER);
        drivers.forEach(driver -> driver.setPassword(null));
        return drivers;
    }

    @Transactional
    public User createUser(User user, String plainPassword) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(plainPassword));

        // Ensure user is active
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }

        user = userRepository.save(user);
        user.setPassword(null);
        return user;
    }

    @Deprecated
    @Transactional
    public User createUser(String email, String password, String firstName, String lastName,
                          UserRole role, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists with email: " + email);
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setPhone(phone);
        user.setIsActive(true);

        user = userRepository.save(user);
        user.setPassword(null);
        return user;
    }

    @Transactional
    public User updateUser(User user) {
        user = userRepository.save(user);
        user.setPassword(null);
        return user;
    }

    @Deprecated
    @Transactional
    public User updateUser(String id, String email, String firstName, String lastName,
                          UserRole role, String phone, Boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (email != null) user.setEmail(email);
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (role != null) user.setRole(role);
        if (phone != null) user.setPhone(phone);
        if (isActive != null) user.setIsActive(isActive);

        user = userRepository.save(user);
        user.setPassword(null);
        return user;
    }

    @Transactional
    public User deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
        user.setPassword(null);
        return user;
    }
}
