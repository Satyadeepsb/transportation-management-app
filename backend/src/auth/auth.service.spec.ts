import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockUser, createMockCustomer } from '../../test/fixtures/user.fixtures';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerInput: RegisterInput = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: 'CUSTOMER',
      phone: '1234567890',
    };

    it('should register new user with hashed password', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      const hashedPassword = '$2b$10$hashedpassword';
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const createdUser = createMockUser({
        email: registerInput.email,
        password: hashedPassword,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
      });

      prismaService.user.create.mockResolvedValue(createdUser);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.register(registerInput);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerInput.email },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerInput.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerInput.email,
          password: hashedPassword,
          firstName: registerInput.firstName,
          lastName: registerInput.lastName,
          role: registerInput.role,
          phone: registerInput.phone,
        },
      });
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user: createdUser,
      });
    });

    it('should throw ConflictException if email exists', async () => {
      // Arrange
      const existingUser = createMockUser({ email: registerInput.email });
      prismaService.user.findUnique.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerInput)).rejects.toThrow(
        new ConflictException('User with this email already exists'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerInput.email },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should return access token and user on successful registration', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('$2b$10$hashedpassword' as never);

      const createdUser = createMockUser();
      prismaService.user.create.mockResolvedValue(createdUser);

      const mockToken = 'mock-jwt-token-12345';
      jwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.register(registerInput);

      // Assert
      expect(result).toHaveProperty('accessToken', mockToken);
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(createdUser);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      });
    });
  });

  describe('login', () => {
    const loginInput: LoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login with valid credentials', async () => {
      // Arrange
      const user = createMockUser({
        email: loginInput.email,
        password: '$2b$10$hashedpassword',
        isActive: true,
      });

      prismaService.user.findUnique.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.login(loginInput);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginInput.email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        user.password,
      );
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user,
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginInput.email },
      });
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      // Arrange
      const inactiveUser = createMockUser({
        email: loginInput.email,
        isActive: false,
      });

      prismaService.user.findUnique.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(
        new UnauthorizedException('Account is inactive'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginInput.email },
      });
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange
      const user = createMockUser({
        email: loginInput.email,
        password: '$2b$10$hashedpassword',
        isActive: true,
      });

      prismaService.user.findUnique.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        user.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should generate JWT token on successful login', async () => {
      // Arrange
      const user = createMockCustomer();
      user.isActive = true;

      prismaService.user.findUnique.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const mockToken = 'jwt-token-xyz';
      jwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.login(loginInput);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(result.accessToken).toBe(mockToken);
    });
  });

  describe('validateUser', () => {
    it('should validate user by ID', async () => {
      // Arrange
      const user = createMockUser();
      prismaService.user.findUnique.mockResolvedValue(user);

      // Act
      const result = await service.validateUser(user.id);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(result).toEqual(user);
    });

    it('should return null for non-existent user', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('non-existent-id');

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });
  });
});
