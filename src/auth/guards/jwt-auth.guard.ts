/**
 * auth/guards/jwt-auth.guard.ts - Authentication Guard
 * =======================================================
 * A Guard is like a bouncer at a club — it decides who gets in.
 *
 * JwtAuthGuard extends Passport's AuthGuard('jwt'), which:
 * 1. Extracts the Bearer token from the Authorization header
 * 2. Calls JwtStrategy.validate() to verify it
 * 3. If valid → attaches user to request and allows the route
 * 4. If invalid → throws 401 Unauthorized
 *
 * Usage on a single endpoint:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile() { ... }
 *
 * Usage on an entire controller (all endpoints require auth):
 *   @UseGuards(JwtAuthGuard)
 *   @Controller('users')
 *   export class UsersController { ... }
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
