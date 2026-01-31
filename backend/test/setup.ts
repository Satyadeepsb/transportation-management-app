import { PrismaService } from '../src/prisma/prisma.service';

// Global test setup
beforeAll(async () => {
  // Setup logic - currently using mocked PrismaService
  // No database connection needed
});

afterAll(async () => {
  // Cleanup logic
});

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
});
