/**
 * common/decorators/response-message.decorator.ts
 * =================================================
 * A custom decorator that lets you set a custom success message on any endpoint.
 *
 * Without this, every success response would just say "Success". With it:
 *
 *   @ResponseMessage('Profile updated successfully')
 *   @Patch('profile')
 *   updateProfile() { ... }
 *
 * The TransformInterceptor reads this metadata and puts the message in the
 * response's meta.message field.
 *
 * How it works under the hood:
 * - SetMetadata() attaches a key-value pair to the route handler
 * - The interceptor later reads it with Reflect.getMetadata()
 * - If no @ResponseMessage() is set, the interceptor defaults to "Success"
 */

import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE = 'response_message';

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
