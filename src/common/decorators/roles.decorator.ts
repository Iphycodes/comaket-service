/**
 * common/decorators/roles.decorator.ts
 * ======================================
 * Role-based access control decorator. Marks which roles can access an endpoint.
 *
 * Usage:
 *   @Roles(UserRole.Admin, UserRole.SuperAdmin)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('dashboard')
 *   getAdminDashboard() { ... }
 *
 * How it works:
 * 1. @Roles() attaches the allowed roles as metadata to the route handler
 * 2. RolesGuard reads this metadata at runtime
 * 3. If the logged-in user's role isn't in the list → 403 Forbidden
 *
 * You can stack multiple roles — the user just needs to match ONE of them:
 *   @Roles(UserRole.Admin, UserRole.SuperAdmin)
 *   means: "admins OR super admins can access this"
 */

import { UserRole } from '@config/contants';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);