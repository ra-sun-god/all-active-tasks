import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, './.env') });

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema/index.ts',  
  out: './drizzle',                    
  dbCredentials: {
    url: path.resolve(__dirname+"/.database/collections_db.sqlite")   
  },
  // Optional: Enable verbose logging for migrations
  verbose: true,
  strict: true,
});
