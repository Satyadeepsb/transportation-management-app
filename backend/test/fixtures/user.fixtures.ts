import { User, UserRole } from '@prisma/client';

/**
 * Creates a mock user with default values
 * @param overrides - Optional partial user object to override defaults
 * @returns Mock User object
 */
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-1',
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.CUSTOMER,
  phone: '1234567890',
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

/**
 * Creates a mock admin user
 * @returns Mock Admin User
 */
export const createMockAdmin = (): User => createMockUser({
  id: 'admin-1',
  role: UserRole.ADMIN,
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
});

/**
 * Creates a mock dispatcher user
 * @returns Mock Dispatcher User
 */
export const createMockDispatcher = (): User => createMockUser({
  id: 'dispatcher-1',
  role: UserRole.DISPATCHER,
  email: 'dispatcher@example.com',
  firstName: 'Dispatcher',
  lastName: 'User',
});

/**
 * Creates a mock driver user
 * @returns Mock Driver User
 */
export const createMockDriver = (): User => createMockUser({
  id: 'driver-1',
  role: UserRole.DRIVER,
  email: 'driver@example.com',
  firstName: 'Driver',
  lastName: 'User',
});

/**
 * Creates a mock customer user
 * @returns Mock Customer User
 */
export const createMockCustomer = (): User => createMockUser({
  id: 'customer-1',
  role: UserRole.CUSTOMER,
  email: 'customer@example.com',
  firstName: 'Customer',
  lastName: 'User',
});
