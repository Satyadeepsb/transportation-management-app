import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UserFilterInput } from './dto/user-filter.input';
import { PaginationInput } from '../shipment/dto/shipment-filter.input';
import { PaginatedUsersResponse } from './entities/paginated-users.entity';

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
   * Get all users with pagination and filtering
   */
  @Query(() => PaginatedUsersResponse, { description: 'Get paginated list of users with optional filters' })
  async users(
    @Args('filter', { type: () => UserFilterInput, nullable: true }) filter?: UserFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.findAllPaginated(filter, pagination);
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
