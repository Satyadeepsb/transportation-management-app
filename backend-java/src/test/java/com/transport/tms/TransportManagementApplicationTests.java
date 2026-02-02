package com.transport.tms;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test to verify Spring application context loads correctly
 *
 * This is a basic sanity check that:
 * - All beans can be created
 * - No circular dependencies
 * - Configuration is valid
 * - Application can start
 */
@SpringBootTest
@DisplayName("Application Context Tests")
class TransportManagementApplicationTests {

    @Test
    @DisplayName("Application context should load successfully")
    void contextLoads() {
        // This test passes if the application context loads without errors
        // Spring will automatically fail this test if:
        // - Bean creation fails
        // - Circular dependencies exist
        // - Configuration errors are present
    }
}
