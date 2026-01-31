import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '@prisma/client';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Computed field: Full name
   */
  @ResolveField('fullName', () => String)
  getFullName(@Parent() user: UserEntity): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Get all users
   */
  @Query(() => [UserEntity], { description: 'Get all users with optional role filter' })
  async users(
    @Args('role', { type: () => UserRole, nullable: true }) role?: UserRole,
  ): Promise<UserEntity[]> {
    return this.usersService.findAll(role);
  }

  /**
   * Get a single user by ID
   */
  @Query(() => UserEntity, { description: 'Get a single user by ID' })
  async user(@Args('id', { type: () => String }) id: string): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }

  /**
   * Get all active drivers (for shipment assignment)
   */
  @Query(() => [UserEntity], { description: 'Get all active drivers' })
  async drivers(): Promise<UserEntity[]> {
    return this.usersService.findAllDrivers();
  }
}
