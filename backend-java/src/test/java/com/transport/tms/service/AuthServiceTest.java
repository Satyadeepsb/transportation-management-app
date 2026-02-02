package com.transport.tms.service;

import com.transport.tms.dto.AuthResponse;
import com.transport.tms.model.User;
import com.transport.tms.model.UserRole;
import com.transport.tms.repository.UserRepository;
import com.transport.tms.security.CustomUserDetails;
import com.transport.tms.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService
 *
 * Testing Strategy:
 * - Mock all dependencies (UserRepository, PasswordEncoder, JwtUtil, AuthenticationManager)
 * - Test business logic in isolation
 * - Verify interactions with mocked dependencies
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "password123";
    private static final String ENCODED_PASSWORD = "$2a$10$encodedpassword";
    private static final String JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("test-user-id");
        testUser.setEmail(TEST_EMAIL);
        testUser.setPassword(ENCODED_PASSWORD);
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(UserRole.ADMIN);
        testUser.setIsActive(true);
    }

    // ==================== Registration Tests ====================

    @Test
    @DisplayName("Register - Should create user successfully with valid data")
    void register_withValidData_shouldCreateUserSuccessfully() {
        // Given
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(any(CustomUserDetails.class))).thenReturn(JWT_TOKEN);

        // When
        AuthResponse response = authService.register(
            TEST_EMAIL, TEST_PASSWORD, "Test", "User", UserRole.ADMIN, "1234567890"
        );

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo(JWT_TOKEN);
        assertThat(response.getUser().getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(response.getUser().getPassword()).isNull(); // Password should be removed

        verify(userRepository).existsByEmail(TEST_EMAIL);
        verify(passwordEncoder).encode(TEST_PASSWORD);
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken(any(CustomUserDetails.class));
    }

    @Test
    @DisplayName("Register - Should encrypt password before saving")
    void register_shouldEncryptPasswordBeforeSaving() {
        // Given
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            // Verify password was encrypted before save
            assertThat(user.getPassword()).isEqualTo(ENCODED_PASSWORD);
            return user;
        });
        when(jwtUtil.generateToken(any(CustomUserDetails.class))).thenReturn(JWT_TOKEN);

        // When
        authService.register(TEST_EMAIL, TEST_PASSWORD, "Test", "User", UserRole.ADMIN, null);

        // Then
        verify(passwordEncoder).encode(TEST_PASSWORD);
    }

    @Test
    @DisplayName("Register - Should set default role to CUSTOMER when role is null")
    void register_withNullRole_shouldSetDefaultCustomerRole() {
        // Given
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertThat(user.getRole()).isEqualTo(UserRole.CUSTOMER);
            return user;
        });
        when(jwtUtil.generateToken(any(CustomUserDetails.class))).thenReturn(JWT_TOKEN);

        // When
        authService.register(TEST_EMAIL, TEST_PASSWORD, "Test", "User", null, null);

        // Then
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register - Should set isActive to true by default")
    void register_shouldSetIsActiveToTrue() {
        // Given
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertThat(user.getIsActive()).isTrue();
            return user;
        });
        when(jwtUtil.generateToken(any(CustomUserDetails.class))).thenReturn(JWT_TOKEN);

        // When
        authService.register(TEST_EMAIL, TEST_PASSWORD, "Test", "User", UserRole.ADMIN, null);

        // Then
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register - Should throw exception when email already exists")
    void register_withExistingEmail_shouldThrowException() {
        // Given
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() ->
            authService.register(TEST_EMAIL, TEST_PASSWORD, "Test", "User", UserRole.ADMIN, null)
        )
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("User already exists with email");

        verify(userRepository).existsByEmail(TEST_EMAIL);
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("Register - Should not return password in response")
    void register_shouldNotReturnPasswordInResponse() {
        // Given
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(any(CustomUserDetails.class))).thenReturn(JWT_TOKEN);

        // When
        AuthResponse response = authService.register(
            TEST_EMAIL, TEST_PASSWORD, "Test", "User", UserRole.ADMIN, null
        );

        // Then
        assertThat(response.getUser().getPassword()).isNull();
    }

    // ==================== Login Tests ====================

    @Test
    @DisplayName("Login - Should authenticate user successfully with valid credentials")
    void login_withValidCredentials_shouldAuthenticateSuccessfully() {
        // Given
        Authentication authentication = mock(Authentication.class);
        CustomUserDetails userDetails = new CustomUserDetails(testUser);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn(JWT_TOKEN);

        // When
        AuthResponse response = authService.login(TEST_EMAIL, TEST_PASSWORD);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo(JWT_TOKEN);
        assertThat(response.getUser().getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(response.getUser().getPassword()).isNull();

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil).generateToken(userDetails);
    }

    @Test
    @DisplayName("Login - Should throw exception with invalid credentials")
    void login_withInvalidCredentials_shouldThrowException() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid credentials"));

        // When & Then
        assertThatThrownBy(() -> authService.login(TEST_EMAIL, "wrongpassword"))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessageContaining("Invalid credentials");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    @DisplayName("Login - Should not return password in response")
    void login_shouldNotReturnPasswordInResponse() {
        // Given
        Authentication authentication = mock(Authentication.class);
        CustomUserDetails userDetails = new CustomUserDetails(testUser);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn(JWT_TOKEN);

        // When
        AuthResponse response = authService.login(TEST_EMAIL, TEST_PASSWORD);

        // Then
        assertThat(response.getUser().getPassword()).isNull();
    }

    // ==================== Get Current User Tests ====================

    @Test
    @DisplayName("GetCurrentUser - Should return user when found")
    void getCurrentUser_whenUserExists_shouldReturnUser() {
        // Given
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        // When
        User result = authService.getCurrentUser(TEST_EMAIL);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(result.getPassword()).isNull();

        verify(userRepository).findByEmail(TEST_EMAIL);
    }

    @Test
    @DisplayName("GetCurrentUser - Should throw exception when user not found")
    void getCurrentUser_whenUserNotFound_shouldThrowException() {
        // Given
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.getCurrentUser(TEST_EMAIL))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("User not found");

        verify(userRepository).findByEmail(TEST_EMAIL);
    }

    @Test
    @DisplayName("GetCurrentUser - Should not return password")
    void getCurrentUser_shouldNotReturnPassword() {
        // Given
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        // When
        User result = authService.getCurrentUser(TEST_EMAIL);

        // Then
        assertThat(result.getPassword()).isNull();
    }
}
