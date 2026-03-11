/**
 * common/decorators/get-user.decorator.ts
 * =========================================
 * Custom parameter decorator that extracts the authenticated user from the request.
 *
 * When a user logs in, they get a JWT token. On subsequent requests, they send
 * this token in the Authorization header. The JwtAuthGuard validates it and
 * attaches the decoded payload to request.user.
 *
 * Instead of writing `@Req() req` and then `req.user` every time, this decorator
 * gives you a clean shorthand:
 *
 *   @Get('profile')
 *   getProfile(@GetUser() user: JwtPayload) {
 *     // user = { sub: '507f1f77bcf86...', email: 'john@example.com' }
 *     return this.usersService.getProfile(user.sub);
 *   }
 *
 * You can also extract a specific field:
 *   @Get('profile')
 *   getProfile(@GetUser('sub') userId: string) {
 *     return this.usersService.getProfile(userId);
 *   }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string; // User's MongoDB _id
  email: string;
  role: string;
}

export const GetUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific field was requested, return just that field
    if (data) {
      return user?.[data];
    }

    // Otherwise return the whole user payload
    return user;
  },
);