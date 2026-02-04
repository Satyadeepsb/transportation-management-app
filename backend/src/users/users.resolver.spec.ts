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
      findAllPaginated: jest.fn(),
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
    it('should get all users without filters', async () => {
      // Arrange
      const mockUsers = [
        createMockAdmin(),
        createMockDriver(),
        createMockCustomer(),
        createMockDispatcher(),
      ];
      const mockResponse = {
        data: mockUsers,
        meta: {
          total: 4,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      usersService.findAllPaginated.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.users();

      // Assert
      expect(usersService.findAllPaginated).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(4);
    });

    it('should get users filtered by DRIVER role', async () => {
      // Arrange
      const mockDrivers = [createMockDriver(), createMockDriver()];
      const mockResponse = {
        data: mockDrivers,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      usersService.findAllPaginated.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.users({ role: UserRole.DRIVER });

      // Assert
      expect(usersService.findAllPaginated).toHaveBeenCalledWith({ role: UserRole.DRIVER }, undefined);
      expect(result).toEqual(mockResponse);
      expect(result.data.every(user => user.role === UserRole.DRIVER)).toBe(true);
    });

    it('should get users filtered by ADMIN role', async () => {
      // Arrange
      const mockAdmins = [createMockAdmin()];
      const mockResponse = {
        data: mockAdmins,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      usersService.findAllPaginated.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.users({ role: UserRole.ADMIN });

      // Assert
      expect(usersService.findAllPaginated).toHaveBeenCalledWith({ role: UserRole.ADMIN }, undefined);
      expect(result).toEqual(mockResponse);
      expect(result.data[0].role).toBe(UserRole.ADMIN);
    });

    it('should get users filtered by CUSTOMER role', async () => {
      // Arrange
      const mockCustomers = [createMockCustomer()];
      const mockResponse = {
        data: mockCustomers,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      usersService.findAllPaginated.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.users({ role: UserRole.CUSTOMER });

      // Assert
      expect(usersService.findAllPaginated).toHaveBeenCalledWith({ role: UserRole.CUSTOMER }, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get users filtered by DISPATCHER role', async () => {
      // Arrange
      const mockDispatchers = [createMockDispatcher()];
      const mockResponse = {
        data: mockDispatchers,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      usersService.findAllPaginated.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.users({ role: UserRole.DISPATCHER });

      // Assert
      expect(usersService.findAllPaginated).toHaveBeenCalledWith({ role: UserRole.DISPATCHER }, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should support pagination', async () => {
      // Arrange
      const mockUsers = [createMockAdmin(), createMockDriver()];
      const mockResponse = {
        data: mockUsers,
        meta: {
          total: 10,
          page: 2,
          limit: 2,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };
      usersService.findAllPaginated.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.users(undefined, { page: 2, limit: 2 });

      // Assert
      expect(usersService.findAllPaginated).toHaveBeenCalledWith(undefined, { page: 2, limit: 2 });
      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('user', () => {
    it('should get a single user by ID', async () => {
      // Arrange
      const mockUser = createMockAdmin();
      usersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await resolver.user(mockUser.id);

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('drivers', () => {
    it('should get all active drivers', async () => {
      // Arrange
      const mockDrivers = [createMockDriver(), createMockDriver()];
      usersService.findAllDrivers.mockResolvedValue(mockDrivers);

      // Act
      const result = await resolver.drivers();

      // Assert
      expect(usersService.findAllDrivers).toHaveBeenCalled();
      expect(result).toEqual(mockDrivers);
    });
  });
});
