package com.transport.tms.repository;

import com.transport.tms.model.User;
import com.transport.tms.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for UserRepository
 *
 * Testing Strategy:
 * - @DataJpaTest loads only JPA components (faster than @SpringBootTest)
 * - Uses TestEntityManager for test data setup
 * - Automatic rollback after each test
 * - Tests actual database queries (not mocked)
 *
 * NOTE: These tests use PostgreSQL dialect but can use H2 for faster execution
 */
@DataJpaTest
@DisplayName("UserRepository Integration Tests")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword("$2a$10$encodedpassword");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(UserRole.ADMIN);
        testUser.setPhone("1234567890");
        testUser.setIsActive(true);
    }

    // ==================== FindByEmail Tests ====================

    @Test
    @DisplayName("FindByEmail - Should find user by email")
    void findByEmail_whenUserExists_shouldReturnUser() {
        // Given
        entityManager.persist(testUser);
        entityManager.flush();

        // When
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        assertThat(found.get().getFirstName()).isEqualTo("Test");
        assertThat(found.get().getLastName()).isEqualTo("User");
    }

    @Test
    @DisplayName("FindByEmail - Should return empty when user not found")
    void findByEmail_whenUserNotFound_shouldReturnEmpty() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("FindByEmail - Should be case-sensitive")
    void findByEmail_shouldBeCaseSensitive() {
        // Given
        entityManager.persist(testUser);
        entityManager.flush();

        // When
        Optional<User> foundUppercase = userRepository.findByEmail("TEST@EXAMPLE.COM");
        Optional<User> foundLowercase = userRepository.findByEmail("test@example.com");

        // Then
        assertThat(foundUppercase).isEmpty();
        assertThat(foundLowercase).isPresent();
    }

    // ==================== ExistsByEmail Tests ====================

    @Test
    @DisplayName("ExistsByEmail - Should return true when email exists")
    void existsByEmail_whenEmailExists_shouldReturnTrue() {
        // Given
        entityManager.persist(testUser);
        entityManager.flush();

        // When
        boolean exists = userRepository.existsByEmail("test@example.com");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("ExistsByEmail - Should return false when email does not exist")
    void existsByEmail_whenEmailNotExists_shouldReturnFalse() {
        // When
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // Then
        assertThat(exists).isFalse();
    }

    // ==================== FindByRole Tests ====================

    @Test
    @DisplayName("FindByRole - Should find users by role")
    void findByRole_shouldReturnUsersWithSpecificRole() {
        // Given
        User admin1 = createUser("admin1@example.com", UserRole.ADMIN);
        User admin2 = createUser("admin2@example.com", UserRole.ADMIN);
        User driver = createUser("driver@example.com", UserRole.DRIVER);

        entityManager.persist(admin1);
        entityManager.persist(admin2);
        entityManager.persist(driver);
        entityManager.flush();

        // When
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        List<User> drivers = userRepository.findByRole(UserRole.DRIVER);

        // Then
        assertThat(admins).hasSize(2);
        assertThat(admins).extracting(User::getRole).containsOnly(UserRole.ADMIN);
        assertThat(drivers).hasSize(1);
        assertThat(drivers).extracting(User::getRole).containsOnly(UserRole.DRIVER);
    }

    @Test
    @DisplayName("FindByRole - Should return empty list when no users with role")
    void findByRole_whenNoUsersWithRole_shouldReturnEmptyList() {
        // When
        List<User> customers = userRepository.findByRole(UserRole.CUSTOMER);

        // Then
        assertThat(customers).isEmpty();
    }

    // ==================== Save Tests ====================

    @Test
    @DisplayName("Save - Should persist new user")
    void save_shouldPersistNewUser() {
        // When
        User saved = userRepository.save(testUser);

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("test@example.com");

        // Verify it's actually in database
        User found = entityManager.find(User.class, saved.getId());
        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Save - Should generate UUID for id")
    void save_shouldGenerateUuidForId() {
        // When
        User saved = userRepository.save(testUser);

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getId()).matches("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");
    }

    @Test
    @DisplayName("Save - Should set timestamps automatically")
    void save_shouldSetTimestampsAutomatically() {
        // When
        User saved = userRepository.save(testUser);
        entityManager.flush();
        entityManager.clear();

        // Then
        User found = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getCreatedAt()).isNotNull();
        assertThat(found.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Save - Should update existing user")
    void save_shouldUpdateExistingUser() {
        // Given
        User saved = userRepository.save(testUser);
        entityManager.flush();
        entityManager.clear();

        // When
        User toUpdate = userRepository.findById(saved.getId()).orElseThrow();
        toUpdate.setFirstName("Updated");
        toUpdate.setLastName("Name");
        userRepository.save(toUpdate);
        entityManager.flush();
        entityManager.clear();

        // Then
        User updated = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getFirstName()).isEqualTo("Updated");
        assertThat(updated.getLastName()).isEqualTo("Name");
        assertThat(updated.getEmail()).isEqualTo("test@example.com"); // Unchanged
    }

    // ==================== Delete Tests ====================

    @Test
    @DisplayName("Delete - Should remove user from database")
    void delete_shouldRemoveUser() {
        // Given
        User saved = userRepository.save(testUser);
        String userId = saved.getId();
        entityManager.flush();

        // When
        userRepository.delete(saved);
        entityManager.flush();

        // Then
        Optional<User> found = userRepository.findById(userId);
        assertThat(found).isEmpty();
    }

    // ==================== FindAll Tests ====================

    @Test
    @DisplayName("FindAll - Should return all users")
    void findAll_shouldReturnAllUsers() {
        // Given
        User user1 = createUser("user1@example.com", UserRole.ADMIN);
        User user2 = createUser("user2@example.com", UserRole.DRIVER);
        User user3 = createUser("user3@example.com", UserRole.CUSTOMER);

        entityManager.persist(user1);
        entityManager.persist(user2);
        entityManager.persist(user3);
        entityManager.flush();

        // When
        List<User> allUsers = userRepository.findAll();

        // Then
        assertThat(allUsers).hasSize(3);
        assertThat(allUsers).extracting(User::getEmail)
            .containsExactlyInAnyOrder(
                "user1@example.com",
                "user2@example.com",
                "user3@example.com"
            );
    }

    @Test
    @DisplayName("FindAll - Should return empty list when no users")
    void findAll_whenNoUsers_shouldReturnEmptyList() {
        // When
        List<User> allUsers = userRepository.findAll();

        // Then
        assertThat(allUsers).isEmpty();
    }

    // ==================== FindById Tests ====================

    @Test
    @DisplayName("FindById - Should find user by id")
    void findById_whenUserExists_shouldReturnUser() {
        // Given
        User saved = userRepository.save(testUser);
        entityManager.flush();

        // When
        Optional<User> found = userRepository.findById(saved.getId());

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("FindById - Should return empty when user not found")
    void findById_whenUserNotFound_shouldReturnEmpty() {
        // When
        Optional<User> found = userRepository.findById("non-existent-id");

        // Then
        assertThat(found).isEmpty();
    }

    // ==================== Constraint Tests ====================

    @Test
    @DisplayName("Constraint - Should enforce unique email")
    void save_withDuplicateEmail_shouldThrowException() {
        // Given
        userRepository.save(testUser);
        entityManager.flush();

        User duplicate = createUser("test@example.com", UserRole.CUSTOMER);

        // When & Then
        assertThatThrownBy(() -> {
            userRepository.save(duplicate);
            entityManager.flush();
        }).isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("Constraint - Should allow null phone")
    void save_withNullPhone_shouldSucceed() {
        // Given
        testUser.setPhone(null);

        // When
        User saved = userRepository.save(testUser);
        entityManager.flush();

        // Then
        assertThat(saved.getPhone()).isNull();
    }

    @Test
    @DisplayName("Constraint - Should not allow null email")
    void save_withNullEmail_shouldThrowException() {
        // Given
        testUser.setEmail(null);

        // When & Then
        assertThatThrownBy(() -> {
            userRepository.save(testUser);
            entityManager.flush();
        }).isInstanceOf(Exception.class);
    }

    // ==================== Helper Methods ====================

    private User createUser(String email, UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword("$2a$10$encodedpassword");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(role);
        user.setIsActive(true);
        return user;
    }
}
