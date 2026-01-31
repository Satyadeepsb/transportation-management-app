import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * @Roles Decorator
 * Marks a resolver/query/mutation with required roles
 *
 * Usage:
 * @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
 * @UseGuards(GqlAuthGuard, RolesGuard)
 * async deleteShipment(@Args('id') id: string) {
 *   // Only ADMIN and DISPATCHER can access
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
