/**
 * config/database.config.ts - Database Configuration
 * ====================================================
 * Separated from app config because database settings are their own concern.
 *
 * registerAs('database') means all values here are accessed under the 'database' key:
 *   this.configService.get<string>('database.uri')
 *
 * Why not just use process.env.MONGODB_URI directly?
 * - Centralized: all config lives in one place
 * - Default values: if env var is missing, you get a fallback
 * - Testable: you can mock ConfigService in tests
 */

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/comaket',
}));
