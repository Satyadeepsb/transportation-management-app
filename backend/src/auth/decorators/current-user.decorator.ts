import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * @CurrentUser Decorator
 * Extracts authenticated user from GraphQL context
 *
 * Usage:
 * @UseGuards(GqlAuthGuard)
 * async myQuery(@CurrentUser() user: User) {
 *   console.log(user.id, user.email, user.role);
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
