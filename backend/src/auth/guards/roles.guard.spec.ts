import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';
import { createMockAdmin, createMockDriver, createMockCustomer } from '../../../test/fixtures/user.fixtures';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    it('should allow access when user has required role', () => {
      // Arrange
      const adminUser = createMockAdmin();
      const requiredRoles = [UserRole.ADMIN];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      const mockRequest = { user: adminUser };
      const mockContext = { req: mockRequest };
      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should deny access when user lacks required role', () => {
      // Arrange
      const customerUser = createMockCustomer();
      const requiredRoles = [UserRole.ADMIN];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      const mockRequest = { user: customerUser };
      const mockContext = { req: mockRequest };
      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should allow access when no roles required', () => {
      // Arrange
      const customerUser = createMockCustomer();

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const mockRequest = { user: customerUser };
      const mockContext = { req: mockRequest };
      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should allow access when user has any of the multiple required roles', () => {
      // Arrange
      const driverUser = createMockDriver();
      const requiredRoles = [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      const mockRequest = { user: driverUser };
      const mockContext = { req: mockRequest };
      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access when user does not have any of the required roles', () => {
      // Arrange
      const customerUser = createMockCustomer();
      const requiredRoles = [UserRole.ADMIN, UserRole.DISPATCHER];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      const mockRequest = { user: customerUser };
      const mockContext = { req: mockRequest };
      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should deny access when user is not authenticated', () => {
      // Arrange
      const requiredRoles = [UserRole.ADMIN];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      const mockRequest = { user: null };
      const mockContext = { req: mockRequest };
      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should deny access when user is undefined', () => {
      // Arrange
      const requiredRoles = [UserRole.CUSTOMER];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      const mockRequest = { user: undefined };
      const mockContext = { req: mockRequest };
      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });
  });
});
