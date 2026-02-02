package com.transport.tms.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for JwtUtil
 *
 * Testing Strategy:
 * - Test token generation
 * - Test token validation
 * - Test token expiration
 * - Test token tampering detection
 * - Test claims extraction
 */
@DisplayName("JwtUtil Unit Tests")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private UserDetails userDetails;
    private static final String TEST_SECRET = "test-secret-key-must-be-at-least-32-characters-long-for-security";
    private static final Long TEST_EXPIRATION = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();

        // Set private fields using reflection (for testing)
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", TEST_EXPIRATION);

        // Create mock UserDetails
        userDetails = org.springframework.security.core.userdetails.User
            .withUsername("test@example.com")
            .password("password")
            .roles("USER")
            .build();
    }

    // ==================== Token Generation Tests ====================

    @Test
    @DisplayName("GenerateToken - Should create non-null token")
    void generateToken_shouldCreateNonNullToken() {
        // When
        String token = jwtUtil.generateToken(userDetails);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    @Test
    @DisplayName("GenerateToken - Should create token with three parts (header.payload.signature)")
    void generateToken_shouldHaveThreeParts() {
        // When
        String token = jwtUtil.generateToken(userDetails);

        // Then
        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
    }

    @Test
    @DisplayName("GenerateToken - Should embed username in token")
    void generateToken_shouldEmbedUsername() {
        // When
        String token = jwtUtil.generateToken(userDetails);

        // Then
        String extractedUsername = jwtUtil.extractUsername(token);
        assertThat(extractedUsername).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("GenerateToken - Should set expiration time")
    void generateToken_shouldSetExpirationTime() {
        // When
        String token = jwtUtil.generateToken(userDetails);

        // Then
        Date expiration = jwtUtil.extractExpiration(token);
        assertThat(expiration).isAfter(new Date());
    }

    @Test
    @DisplayName("GenerateToken - Should create unique tokens for multiple calls")
    void generateToken_shouldCreateUniqueTokens() throws InterruptedException {
        // When
        String token1 = jwtUtil.generateToken(userDetails);
        Thread.sleep(1000); // Wait 1 second to ensure different timestamps
        String token2 = jwtUtil.generateToken(userDetails);

        // Then
        assertThat(token1).isNotEqualTo(token2); // Different because issued at different times
    }

    // ==================== Token Validation Tests ====================

    @Test
    @DisplayName("ValidateToken - Should return true for valid token")
    void validateToken_withValidToken_shouldReturnTrue() {
        // Given
        String token = jwtUtil.generateToken(userDetails);

        // When
        Boolean isValid = jwtUtil.validateToken(token, userDetails);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("ValidateToken - Should return false for expired token")
    void validateToken_withExpiredToken_shouldReturnFalse() {
        // Given - Create JWT util with expired token
        JwtUtil expiredJwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(expiredJwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(expiredJwtUtil, "expiration", -1000L); // Already expired

        String expiredToken = expiredJwtUtil.generateToken(userDetails);

        // When & Then
        assertThatThrownBy(() -> jwtUtil.extractUsername(expiredToken))
            .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    @DisplayName("ValidateToken - Should return false for wrong username")
    void validateToken_withWrongUsername_shouldReturnFalse() {
        // Given
        String token = jwtUtil.generateToken(userDetails);
        UserDetails differentUser = org.springframework.security.core.userdetails.User
            .withUsername("different@example.com")
            .password("password")
            .roles("USER")
            .build();

        // When
        Boolean isValid = jwtUtil.validateToken(token, differentUser);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("ValidateToken - Should reject tampered token")
    void validateToken_withTamperedToken_shouldThrowException() {
        // Given
        String token = jwtUtil.generateToken(userDetails);
        String tamperedToken = token.substring(0, token.length() - 10) + "tampered12";

        // When & Then
        assertThatThrownBy(() -> jwtUtil.extractUsername(tamperedToken))
            .isInstanceOf(SignatureException.class);
    }

    @Test
    @DisplayName("ValidateToken - Should reject malformed token")
    void validateToken_withMalformedToken_shouldThrowException() {
        // Given
        String malformedToken = "not.a.valid.jwt.token";

        // When & Then
        assertThatThrownBy(() -> jwtUtil.extractUsername(malformedToken))
            .isInstanceOf(MalformedJwtException.class);
    }

    @Test
    @DisplayName("ValidateToken - Should reject token with wrong secret")
    void validateToken_withWrongSecret_shouldThrowException() {
        // Given
        String token = jwtUtil.generateToken(userDetails);

        // Create new JwtUtil with different secret (must be at least 32 chars for HS256)
        JwtUtil differentSecretJwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(differentSecretJwtUtil, "secret",
            "different-secret-key-must-be-at-least-32-characters-long-different");
        ReflectionTestUtils.setField(differentSecretJwtUtil, "expiration", TEST_EXPIRATION);

        // When & Then
        assertThatThrownBy(() -> differentSecretJwtUtil.extractUsername(token))
            .isInstanceOf(SignatureException.class);
    }

    // ==================== Username Extraction Tests ====================

    @Test
    @DisplayName("ExtractUsername - Should extract correct username")
    void extractUsername_shouldExtractCorrectUsername() {
        // Given
        String token = jwtUtil.generateToken(userDetails);

        // When
        String username = jwtUtil.extractUsername(token);

        // Then
        assertThat(username).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("ExtractUsername - Should handle special characters in email")
    void extractUsername_withSpecialCharacters_shouldExtractCorrectly() {
        // Given
        UserDetails specialUser = org.springframework.security.core.userdetails.User
            .withUsername("user+tag@sub-domain.example.com")
            .password("password")
            .roles("USER")
            .build();
        String token = jwtUtil.generateToken(specialUser);

        // When
        String username = jwtUtil.extractUsername(token);

        // Then
        assertThat(username).isEqualTo("user+tag@sub-domain.example.com");
    }

    // ==================== Expiration Extraction Tests ====================

    @Test
    @DisplayName("ExtractExpiration - Should extract future expiration date")
    void extractExpiration_shouldExtractFutureDate() {
        // Given
        Date beforeGeneration = new Date();
        String token = jwtUtil.generateToken(userDetails);
        Date afterGeneration = new Date(System.currentTimeMillis() + TEST_EXPIRATION + 1000);

        // When
        Date expiration = jwtUtil.extractExpiration(token);

        // Then
        assertThat(expiration).isAfter(beforeGeneration);
        assertThat(expiration).isBefore(afterGeneration);
    }

    @Test
    @DisplayName("ExtractExpiration - Should have approximately correct expiration duration")
    void extractExpiration_shouldHaveCorrectDuration() {
        // Given
        Date beforeGeneration = new Date();
        String token = jwtUtil.generateToken(userDetails);

        // When
        Date expiration = jwtUtil.extractExpiration(token);

        // Then
        long expectedExpirationTime = beforeGeneration.getTime() + TEST_EXPIRATION;
        long actualExpirationTime = expiration.getTime();

        // Allow 5 second tolerance for test execution time
        assertThat(actualExpirationTime).isBetween(
            expectedExpirationTime - 5000,
            expectedExpirationTime + 5000
        );
    }

    // ==================== Integration Tests ====================

    @Test
    @DisplayName("Integration - Should complete full token lifecycle")
    void tokenLifecycle_shouldWorkEndToEnd() {
        // Generate token
        String token = jwtUtil.generateToken(userDetails);
        assertThat(token).isNotNull();

        // Extract username
        String username = jwtUtil.extractUsername(token);
        assertThat(username).isEqualTo(userDetails.getUsername());

        // Extract expiration
        Date expiration = jwtUtil.extractExpiration(token);
        assertThat(expiration).isAfter(new Date());

        // Validate token
        Boolean isValid = jwtUtil.validateToken(token, userDetails);
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Integration - Should handle multiple users")
    void multipleUsers_shouldHaveIndependentTokens() {
        // Given
        UserDetails user1 = org.springframework.security.core.userdetails.User
            .withUsername("user1@example.com")
            .password("password")
            .roles("USER")
            .build();

        UserDetails user2 = org.springframework.security.core.userdetails.User
            .withUsername("user2@example.com")
            .password("password")
            .roles("ADMIN")
            .build();

        // When
        String token1 = jwtUtil.generateToken(user1);
        String token2 = jwtUtil.generateToken(user2);

        // Then
        assertThat(token1).isNotEqualTo(token2);
        assertThat(jwtUtil.extractUsername(token1)).isEqualTo("user1@example.com");
        assertThat(jwtUtil.extractUsername(token2)).isEqualTo("user2@example.com");
        assertThat(jwtUtil.validateToken(token1, user1)).isTrue();
        assertThat(jwtUtil.validateToken(token2, user2)).isTrue();
        assertThat(jwtUtil.validateToken(token1, user2)).isFalse();
        assertThat(jwtUtil.validateToken(token2, user1)).isFalse();
    }

    // ==================== Edge Cases ====================

    @Test
    @DisplayName("EdgeCase - Should handle empty string token")
    void emptyToken_shouldThrowException() {
        // When & Then
        assertThatThrownBy(() -> jwtUtil.extractUsername(""))
            .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("EdgeCase - Should handle null token")
    void nullToken_shouldThrowException() {
        // When & Then
        assertThatThrownBy(() -> jwtUtil.extractUsername(null))
            .isInstanceOf(Exception.class);
    }
}
