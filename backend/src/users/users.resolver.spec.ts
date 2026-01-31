import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
import {
  createMockUser,
  createMockAdmin,
  createMockDriver,
  createMockCustomer,
  createMockDispatcher,
} from '../../test/fixtures/user.fixtures';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: any;

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findAllDrivers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFullName', () => {
    it('should compute full name from firstName and lastName', () => {
      // Arrange
      const user = createMockUser({
        firstName: 'John',
        lastName: 'Doe',
      });

      // Act
      const result = resolver.getFullName(user);

      // Assert
      expect(result).toBe('John Doe');
    });

    it('should handle different names', () => {
      // Arrange
      const user = createMockAdmin();

      // Act
      const result = resolver.getFullName(user);

      // Assert
      expect(result).toBe(`${user.firstName} ${user.lastName}`);
      expect(result).toContain(user.firstName);
      expect(result).toContain(user.lastName);
    });

    it('should concatenate firstName and lastName with space', () => {
      // Arrange
      const user = createMockUser({
        firstName: 'Alice',
        lastName: 'Smith',
      });

      // Act
      const result = resolver.getFullName(user);

      // Assert
      expect(result).toBe('Alice Smith');
      expect(result.includes(' ')).toBe(true);
    });

    it('should work with driver user', () => {
      // Arrange
      const driver = createMockDriver();

      // Act
      const result = resolver.getFullName(driver);

      // Assert
      expect(result).toBe(`${driver.firstName} ${driver.lastName}`);
    });
  });

  describe('users', () => {
    it('should get all users without role filter', async () => {
      // Arrange
      const mockUsers = [
        createMockAdmin(),
        createMockDriver(),
        createMockCustomer(),
        createMockDispatcher(),
      ];
      usersService.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await resolver.users();

      // Assert
      expect(usersService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(4);
    });

    it('should get users filtered by DRIVER role', async () => {
      // Arrange
      const mockDrivers = [createMockDriver(), createMockDriver()];
      usersService.findAll.mockResolvedValue(mockDrivers);

      // Act
      const result = await resolver.users(UserRole.DRIVER);

      // Assert
      expect(usersService.findAll).toHaveBeenCalledWith(UserRole.DRIVER);
      expect(result).toEqual(mockDrivers);
      expect(result.every(user => user.role === UserRole.DRIVER)).toBe(true);
    });

    it('should get users filtered by ADMIN role', async () => {
      // Arrange
      const mockAdmins = [createMockAdmin()];
      usersService.findAll.mockResolvedValue(mockAdmins);

      // Act
      const result = await resolver.users(UserRole.ADMIN);

      // Assert
      expect(usersService.findAll).toHaveBeenCalledWith(UserRole.ADMIN);
      expect(result).toEqual(mockAdmins);
      expect(result[0].role).toBe(UserRole.ADMIN);
    });

    it('should get users filtered by CUSTOMER role', async () => {
      // Arrange
      const mockCustomers = [createMockCustomer()];
      usersService.findAll.mockResolvedValue(mockCustomers);

      // Act
      const result = await resolver.users(UserRole.CUSTOMER);

      // Assert
      expect(usersService.findAll).toHaveBeenCalledWith(UserRole.CUSTOMER);
      expect(result).toEqual(mockCustomers);
    });

    it('should get users filtered by DISPATCHER role', async () => {
      // Arrange
      const mockDispatchers = [createMockDispatcher()];
      usersService.findAll.mockResolvedValue(mockDispatchers);

      // Act
      const result = await resolver.users(UserRole.DISPATCHER);

      // Assert
      expect(usersService.findAll).toHaveBeenCalledWith(UserRole.DISPATCHER);
      expect(result).toEqual(mockDispatchers);
    });

    it('should return empty array when no users found', async () => {
      // Arrange
      usersService.findAll.mockResolvedValue([]);

      // Act
      const result = await resolver.users();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      usersService.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.users()).rejects.toThrow('Database error');
    });
  });

  describe('user', () => {
    it('should get single user by ID', async () => {
      // Arrange
      const mockUser = createMockUser();
      usersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await resolver.user(mockUser.id);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should get admin user by ID', async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      usersService.findOne.mockResolvedValue(mockAdmin);

      // Act
      const result = await resolver.user(mockAdmin.id);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(mockAdmin.id);
      expect(result).toEqual(mockAdmin);
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should get driver user by ID', async () => {
      // Arrange
      const mockDriver = createMockDriver();
      usersService.findOne.mockResolvedValue(mockDriver);

      // Act
      const result = await resolver.user(mockDriver.id);

      // Assert
      expect(result).toEqual(mockDriver);
      expect(result.role).toBe(UserRole.DRIVER);
    });

    it('should handle not found error', async () => {
      // Arrange
      const error = new Error('User not found');
      usersService.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.user('invalid-id')).rejects.toThrow('User not found');
      expect(usersService.findOne).toHaveBeenCalledWith('invalid-id');
    });

    it('should pass correct ID to service', async () => {
      // Arrange
      const userId = 'specific-user-id-123';
      const mockUser = createMockUser({ id: userId });
      usersService.findOne.mockResolvedValue(mockUser);

      // Act
      await resolver.user(userId);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('drivers', () => {
    it('should get all active drivers', async () => {
      // Arrange
      const mockDrivers = [
        createMockDriver(),
        createMockUser({ id: 'driver-2', role: UserRole.DRIVER }),
        createMockUser({ id: 'driver-3', role: UserRole.DRIVER }),
      ];
      usersService.findAllDrivers.mockResolvedValue(mockDrivers);

      // Act
      const result = await resolver.drivers();

      // Assert
      expect(usersService.findAllDrivers).toHaveBeenCalledWith();
      expect(result).toEqual(mockDrivers);
      expect(result).toHaveLength(3);
      expect(result.every(user => user.role === UserRole.DRIVER)).toBe(true);
    });

    it('should return empty array when no drivers found', async () => {
      // Arrange
      usersService.findAllDrivers.mockResolvedValue([]);

      // Act
      const result = await resolver.drivers();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should call findAllDrivers without parameters', async () => {
      // Arrange
      const mockDrivers = [createMockDriver()];
      usersService.findAllDrivers.mockResolvedValue(mockDrivers);

      // Act
      await resolver.drivers();

      // Assert
      expect(usersService.findAllDrivers).toHaveBeenCalledTimes(1);
      expect(usersService.findAllDrivers).toHaveBeenCalledWith();
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Failed to fetch drivers');
      usersService.findAllDrivers.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.drivers()).rejects.toThrow('Failed to fetch drivers');
    });

    it('should return only active drivers', async () => {
      // Arrange
      const mockDrivers = [
        createMockDriver(), // Active by default
        createMockUser({ id: 'driver-2', role: UserRole.DRIVER, isActive: true }),
      ];
      usersService.findAllDrivers.mockResolvedValue(mockDrivers);

      // Act
      const result = await resolver.drivers();

      // Assert
      expect(result.every(user => user.isActive === true)).toBe(true);
    });
  });
});
