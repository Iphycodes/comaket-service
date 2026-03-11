/**
 * auth/strategies/jwt.strategy.ts - JWT Validation Strategy
 * ============================================================
 * This is part of Passport.js integration with NestJS.
 *
 * HOW JWT AUTH WORKS (quick refresher):
 *
 * 1. User logs in → server creates a JWT token containing { sub: userId, email }
 * 2. Frontend stores the token and sends it in every request:
 *    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * 3. For protected routes, JwtAuthGuard intercepts the request
 * 4. JwtAuthGuard calls this JwtStrategy to validate the token
 * 5. JwtStrategy checks the signature, expiration, and extracts the payload
 * 6. The payload is attached to request.user (accessible via @GetUser())
 *
 * The validate() method is called AFTER Passport verifies the token signature
 * and checks expiration. If the token is invalid/expired, Passport throws
 * a 401 before validate() is even called.
 *
 * What validate() returns becomes request.user — which is what @GetUser() reads.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      // Where to find the token in the request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Don't accept expired tokens
      ignoreExpiration: false,

      // The secret used to sign tokens (must match what auth.service uses)
      secretOrKey: configService.get<string>('app.jwt.secret'),

      passReqToCallback: true, // Add this line
    });
  }

  /**
   * Called after Passport verifies the token. The `payload` is the decoded JWT.
   * Whatever we return here becomes `request.user`.
   *
   * We also verify the user still exists in the database — in case
   * the account was deleted after the token was issued.
   */
  async validate(req: any, payload: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been invalidated');
    }
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}