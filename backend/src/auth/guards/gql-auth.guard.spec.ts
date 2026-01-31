import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlAuthGuard } from './gql-auth.guard';

describe('GqlAuthGuard', () => {
  let guard: GqlAuthGuard;

  beforeEach(() => {
    guard = new GqlAuthGuard();
  });

  describe('getRequest', () => {
    it('should extract request from GraphQL context', () => {
      // Arrange
      const mockRequest = {
        headers: { authorization: 'Bearer token123' },
        user: { id: 'user-1', email: 'test@example.com', role: 'CUSTOMER' },
      };

      const mockContext = {
        req: mockRequest,
      };

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {} as ExecutionContext;

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(GqlExecutionContext.create).toHaveBeenCalledWith(mockExecutionContext);
      expect(mockGqlContext.getContext).toHaveBeenCalled();
      expect(result).toEqual(mockRequest);
    });

    it('should work with authenticated request', () => {
      // Arrange
      const mockUser = {
        id: 'auth-user-1',
        email: 'authenticated@example.com',
        role: 'ADMIN',
      };

      const mockRequest = {
        headers: { authorization: 'Bearer valid-jwt-token' },
        user: mockUser,
      };

      const mockContext = {
        req: mockRequest,
      };

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {} as ExecutionContext;

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result.user).toEqual(mockUser);
      expect(result.headers.authorization).toBe('Bearer valid-jwt-token');
    });

    it('should extract request without user for unauthenticated request', () => {
      // Arrange
      const mockRequest = {
        headers: {},
      };

      const mockContext = {
        req: mockRequest,
      };

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue(mockContext),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);

      const mockExecutionContext = {} as ExecutionContext;

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result).toEqual(mockRequest);
      expect(result.user).toBeUndefined();
    });
  });
});
