import { drizzle } from "drizzle-orm/libsql/node";
import "../utils/load-dot-env"

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
});
