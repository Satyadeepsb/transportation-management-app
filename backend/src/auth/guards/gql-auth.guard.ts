import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * GraphQL Authentication Guard
 * Extends Passport's JWT AuthGuard to work with GraphQL context
 */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  /**
   * Extract request from GraphQL context
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
