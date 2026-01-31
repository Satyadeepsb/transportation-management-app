import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthResponse } from './dto/auth-response';
import { UserEntity } from '../users/entities/user.entity';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   */
  @Mutation(() => AuthResponse, { description: 'Register a new user account' })
  async register(@Args('registerInput') registerInput: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  /**
   * Login user
   */
  @Mutation(() => AuthResponse, { description: 'Login with email and password' })
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  /**
   * Get current authenticated user
   */
  @Query(() => UserEntity, { description: 'Get current authenticated user' })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<UserEntity> {
    return user as UserEntity;
  }
}
