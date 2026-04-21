import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, './.env') });

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/schema/index.ts',  
  out: './drizzle',                    
  dbCredentials: {
    url: process.env.DATABASE_URL!,     
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
  // Optional: Enable verbose logging for migrations
  verbose: true,
  strict: true,
});
