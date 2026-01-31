import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import {
  createMockUser,
  createMockAdmin,
  createMockDriver,
  createMockCustomer,
  createMockDispatcher,
} from '../../test/fixtures/user.fixtures';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      // Arrange
      const mockUsers = [
        createMockAdmin(),
        createMockDriver(),
        createMockCustomer(),
        createMockDispatcher(),
      ];

      prismaService.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(4);
    });

    it('should filter users by role', async () => {
      // Arrange
      const mockDrivers = [createMockDriver()];
      prismaService.user.findMany.mockResolvedValue(mockDrivers);

      // Act
      const result = await service.findAll(UserRole.DRIVER);

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.DRIVER },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockDrivers);
    });

    it('should filter users by ADMIN role', async () => {
      // Arrange
      const mockAdmins = [createMockAdmin()];
      prismaService.user.findMany.mockResolvedValue(mockAdmins);

      // Act
      const result = await service.findAll(UserRole.ADMIN);

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockAdmins);
    });

    it('should order users by createdAt descending', async () => {
      // Arrange
      const mockUsers = [createMockUser()];
      prismaService.user.findMany.mockResolvedValue(mockUsers);

      // Act
      await service.findAll();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return empty array when no users found', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find user by ID', async () => {
      // Arrange
      const user = createMockUser();
      prismaService.user.findUnique.mockResolvedValue(user);

      // Act
      const result = await service.findOne(user.id);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      // Arrange
      const invalidId = 'non-existent-id';
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(invalidId)).rejects.toThrow(
        new NotFoundException(`User with ID ${invalidId} not found`),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: invalidId },
      });
    });

    it('should find admin user by ID', async () => {
      // Arrange
      const adminUser = createMockAdmin();
      prismaService.user.findUnique.mockResolvedValue(adminUser);

      // Act
      const result = await service.findOne(adminUser.id);

      // Assert
      expect(result).toEqual(adminUser);
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should find driver user by ID', async () => {
      // Arrange
      const driverUser = createMockDriver();
      prismaService.user.findUnique.mockResolvedValue(driverUser);

      // Act
      const result = await service.findOne(driverUser.id);

      // Assert
      expect(result).toEqual(driverUser);
      expect(result.role).toBe(UserRole.DRIVER);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const user = createMockUser();
      prismaService.user.findUnique.mockResolvedValue(user);

      // Act
      const result = await service.findByEmail(user.email);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      });
      expect(result).toEqual(user);
    });

    it('should return null for non-existent email', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });

    it('should handle case-sensitive email search', async () => {
      // Arrange
      const email = 'Test@Example.COM';
      const user = createMockUser({ email: email.toLowerCase() });
      prismaService.user.findUnique.mockResolvedValue(user);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(user);
    });
  });

  describe('findAllDrivers', () => {
    it('should find all active drivers', async () => {
      // Arrange
      const mockDrivers = [
        createMockDriver(),
        createMockUser({ id: 'driver-2', role: UserRole.DRIVER, firstName: 'Alice' }),
        createMockUser({ id: 'driver-3', role: UserRole.DRIVER, firstName: 'Bob' }),
      ];

      prismaService.user.findMany.mockResolvedValue(mockDrivers);

      // Act
      const result = await service.findAllDrivers();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          role: UserRole.DRIVER,
          isActive: true,
        },
        orderBy: { firstName: 'asc' },
      });
      expect(result).toEqual(mockDrivers);
      expect(result).toHaveLength(3);
    });

    it('should filter by DRIVER role and active status', async () => {
      // Arrange
      const mockDrivers = [createMockDriver()];
      prismaService.user.findMany.mockResolvedValue(mockDrivers);

      // Act
      await service.findAllDrivers();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            role: UserRole.DRIVER,
            isActive: true,
          },
        }),
      );
    });

    it('should order drivers by firstName ascending', async () => {
      // Arrange
      const mockDrivers = [createMockDriver()];
      prismaService.user.findMany.mockResolvedValue(mockDrivers);

      // Act
      await service.findAllDrivers();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { firstName: 'asc' },
        }),
      );
    });

    it('should return empty array when no active drivers exist', async () => {
      // Arrange
      prismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAllDrivers();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should not include inactive drivers', async () => {
      // Arrange
      const mockDrivers = [createMockDriver()]; // Only active drivers
      prismaService.user.findMany.mockResolvedValue(mockDrivers);

      // Act
      const result = await service.findAllDrivers();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
      expect(result).toEqual(mockDrivers);
    });
  });
});
