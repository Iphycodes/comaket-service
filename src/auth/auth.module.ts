/**
 * auth/auth.module.ts - Authentication Module
 * ==============================================
 * This module wires together everything needed for authentication:
 *
 * IMPORTS (external modules this module depends on):
 *   - UsersModule: We need UsersService to find/create users
 *   - PassportModule: Enables Passport.js strategies (JWT, Google)
 *   - JwtModule: Provides JwtService for signing/verifying tokens
 *
 * PROVIDERS (internal services):
 *   - AuthService: The business logic
 *   - JwtStrategy: Validates JWT tokens on protected routes
 *
 * CONTROLLERS:
 *   - AuthController: The HTTP endpoints
 *
 * EXPORTS:
 *   - AuthService, JwtStrategy: Other modules can use auth functionality
 *
 * JwtModule.registerAsync():
 *   We use "async" because we need ConfigService to read the JWT secret
 *   from the .env file. The factory function receives ConfigService via
 *   dependency injection and returns the JWT configuration.
 *
 * NOTE: In your Redymit app, you imported all the Mongoose schemas directly
 * into AuthModule (User, Transaction, Wallet, etc). That's not ideal because
 * it creates tight coupling. Here, we just import UsersModule which EXPORTS
 * UsersService — that's all auth needs. Clean dependency chain.
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategyy';

@Module({
  imports: [
    // UsersModule exports UsersService, so AuthService can inject it
    UsersModule,

    // PassportModule sets the default strategy to 'jwt'
    // This means @UseGuards(AuthGuard()) defaults to JWT without specifying
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule provides JwtService for creating and verifying tokens
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwt.expiresIn'),
          algorithm: 'HS256',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
