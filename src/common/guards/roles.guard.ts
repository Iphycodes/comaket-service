/**
 * common/guards/roles.guard.ts - Role-Based Access Control
 * ==========================================================
 * A Guard in NestJS runs BEFORE the route handler. It decides whether the
 * request should proceed or be rejected.
 *
 * This guard works with the @Roles() decorator:
 *
 *   @Roles(UserRole.Admin)        ← "Only admins can access this"
 *   @UseGuards(JwtAuthGuard, RolesGuard)  ← "Check JWT, then check role"
 *   @Get('admin/dashboard')
 *   getDashboard() { ... }
 *
 * Flow:
 * 1. JwtAuthGuard validates the token and attaches user to request
 * 2. RolesGuard reads @Roles() metadata to see required roles
 * 3. Compares user's role against required roles
 * 4. Returns true (allow) or throws ForbiddenException (deny)
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@config/contants';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
// import { UserRole } from '../../config/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @Roles() decorator is present, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request (attached by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}