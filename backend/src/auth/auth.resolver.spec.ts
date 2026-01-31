import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { UserRole } from '@prisma/client';
import { createMockUser, createMockCustomer, createMockAdmin } from '../../test/fixtures/user.fixtures';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: any;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get(AuthService);
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

    it('should register a new user', async () => {
      // Arrange
      const mockUser = createMockCustomer();
      const mockResponse = {
        accessToken: 'mock-jwt-token',
        user: mockUser,
      };

      authService.register.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.register(registerInput);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerInput);
      expect(result).toEqual(mockResponse);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual(mockUser);
    });

    it('should pass registerInput to auth service', async () => {
      // Arrange
      const mockResponse = {
        accessToken: 'token',
        user: createMockUser(),
      };
      authService.register.mockResolvedValue(mockResponse);

      // Act
      await resolver.register(registerInput);

      // Assert
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith(registerInput);
    });

    it('should return AuthResponse with token and user', async () => {
      // Arrange
      const mockUser = createMockUser({
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
      });

      const mockResponse = {
        accessToken: 'jwt-token-12345',
        user: mockUser,
      };

      authService.register.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.register(registerInput);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.accessToken).toBe('jwt-token-12345');
      expect(result.user.email).toBe(registerInput.email);
    });

    it('should handle registration errors from service', async () => {
      // Arrange
      const error = new Error('Email already exists');
      authService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.register(registerInput)).rejects.toThrow('Email already exists');
      expect(authService.register).toHaveBeenCalledWith(registerInput);
    });

    it('should register user with ADMIN role', async () => {
      // Arrange
      const adminRegisterInput: RegisterInput = {
        ...registerInput,
        role: 'ADMIN',
      };

      const mockAdmin = createMockAdmin();
      const mockResponse = {
        accessToken: 'admin-token',
        user: mockAdmin,
      };

      authService.register.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.register(adminRegisterInput);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(adminRegisterInput);
      expect(result.user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('login', () => {
    const loginInput: LoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login with valid credentials', async () => {
      // Arrange
      const mockUser = createMockUser({ email: loginInput.email });
      const mockResponse = {
        accessToken: 'mock-jwt-token',
        user: mockUser,
      };

      authService.login.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.login(loginInput);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginInput);
      expect(result).toEqual(mockResponse);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe(loginInput.email);
    });

    it('should pass loginInput to auth service', async () => {
      // Arrange
      const mockResponse = {
        accessToken: 'token',
        user: createMockUser(),
      };
      authService.login.mockResolvedValue(mockResponse);

      // Act
      await resolver.login(loginInput);

      // Assert
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(loginInput);
    });

    it('should return AuthResponse with token and user', async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockResponse = {
        accessToken: 'login-jwt-token',
        user: mockUser,
      };

      authService.login.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.login(loginInput);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(typeof result.accessToken).toBe('string');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
    });

    it('should handle login errors from service', async () => {
      // Arrange
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.login(loginInput)).rejects.toThrow('Invalid credentials');
      expect(authService.login).toHaveBeenCalledWith(loginInput);
    });

    it('should handle unauthorized error for inactive user', async () => {
      // Arrange
      const error = new Error('Account is inactive');
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.login(loginInput)).rejects.toThrow('Account is inactive');
    });
  });

  describe('me', () => {
    it('should return current authenticated user', async () => {
      // Arrange
      const mockUser = createMockUser();

      // Act
      const result = await resolver.me(mockUser);

      // Assert
      expect(result).toEqual(mockUser);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.role).toBe(mockUser.role);
    });

    it('should return user with all properties', async () => {
      // Arrange
      const mockUser = createMockCustomer();

      // Act
      const result = await resolver.me(mockUser);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('isActive');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should return admin user', async () => {
      // Arrange
      const mockAdmin = createMockAdmin();

      // Act
      const result = await resolver.me(mockAdmin);

      // Assert
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.email).toBe(mockAdmin.email);
    });

    it('should return user entity matching input', async () => {
      // Arrange
      const mockUser = createMockUser({
        id: 'specific-user-id',
        email: 'specific@example.com',
        firstName: 'Specific',
        lastName: 'User',
      });

      // Act
      const result = await resolver.me(mockUser);

      // Assert
      expect(result.id).toBe('specific-user-id');
      expect(result.email).toBe('specific@example.com');
      expect(result.firstName).toBe('Specific');
      expect(result.lastName).toBe('User');
    });
  });
});
