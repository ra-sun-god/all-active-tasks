import { db } from '../database';
import { users } from '../schema/users';
import { userRoles } from '../schema/user-roles';
import { roles } from '../schema/roles';
import { hashPassword } from '../../utils/hash';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';
import path from 'path';

config({ path:  path.resolve("../../.env") })


export async function seedSuperAdmin() {
  
  const email = process.env.SUPER_ADMIN_EMAIL?.trim();
  const plainPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !plainPassword) {
    console.log('Skipping super admin seed – missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env');
    return;
  }

  //  Check if super admin already exists (by email)
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) {
    console.log(`Super admin already exists (${email}), skipping seed.`);
    return;
  }

  //  Get the super_admin role ID
  const superAdminRole = await db.select().from(roles).where(eq(roles.name, 'super_admin')).get();
  if (!superAdminRole) {
    throw new Error('Role "super_admin" not found. Run roles/permissions seed first.');
  }

  //  Hash password
  const passwordHash = await hashPassword(plainPassword);

  //  Insert user
  const [newUser] = await db.insert(users)
    .values({
      email,
      passwordHash,
      userName: 'Super Admin',
      avatarUrl: null,
    })
    .returning();

  //  Assign super_admin role
  await db.insert(userRoles).values({
    userId: newUser.id,
    roleId: superAdminRole.id,
  });

  console.log(`✅ Super admin created: ${email} (ID: ${newUser.id})`);

  //  Advise user to remove credentials from .env
  console.warn(`
╔═══════════════════════════════════════════════════════════════════════╗
║  🔐 SECURITY WARNING                                                  ║
║  Super admin credentials have been seeded from your .env file.        ║
║  Please REMOVE or COMMENT OUT the following lines from your .env:     ║
║                                                                       ║
║    SUPER_ADMIN_EMAIL=${email}                                          ║
║    SUPER_ADMIN_PASSWORD=***                                           ║
║                                                                       ║
║  Leaving them in .env is a security risk if your .env is exposed.     ║
╚═══════════════════════════════════════════════════════════════════════╝
  `);
}
