import { db } from '../database';
import { roles } from '../schema/roles';
import { permissions } from '../schema/permissions';
import { rolePermissions } from '../schema/role-permissions';

async function seedRolesAndPermissions() {
  console.log('Seeding roles and permissions...');

  //lets insert default roles (idempotent)
   await db.insert(roles)
    .values([
      { name: 'super_admin', description: 'Full system access – can do anything' },
      { name: 'admin', description: 'Manage content, users, and reviews' },
      { name: 'moderator', description: 'Approve, edit, or delete reviews' },
      { name: 'user', description: 'Default registered user – can write reviews' },
    ])
    .onConflictDoNothing({ target: roles.name })
    .returning();

  // Fetch all roles (whether newly inserted or already existing)
  const allRoles = await db.select().from(roles);
  const roleMap = new Map(allRoles.map(r => [r.name, r.id]));

  // lets now insert permissions (idempotent)
  const permissionList = [
    // Review permissions
    { name: 'reviews:create', description: 'Create a new review' },
    { name: 'reviews:read', description: 'View any review' },
    { name: 'reviews:update', description: 'Edit any review' },
    { name: 'reviews:delete', description: 'Delete any review' },
    { name: 'reviews:moderate', description: 'Approve or flag reviews' },
    
    // User management
    { name: 'users:view', description: 'View user profiles' },
    { name: 'users:ban', description: 'Ban/unban users' },
    { name: 'users:assign_role', description: 'Assign roles to users' },
    
    // Entity (partner) management
    { name: 'entities:create', description: 'Create a new entity' },
    { name: 'entities:update', description: 'Edit entity details' },
    { name: 'entities:delete', description: 'Delete an entity' },
    
    // System
    { name: 'system:logs', description: 'View system logs' },
    { name: 'system:settings', description: 'Modify system settings' },
  ];

  await db.insert(permissions)
    .values(permissionList)
    .onConflictDoNothing({ target: permissions.name });

  const allPermissions = await db.select().from(permissions);
  const permMap = new Map(allPermissions.map(p => [p.name, p.id]));

  const rolePermissionsMap: Record<string, string[]> = {
    super_admin: [
      'reviews:create', 'reviews:read', 'reviews:update', 'reviews:delete', 'reviews:moderate',
      'users:view', 'users:ban', 'users:assign_role',
      'entities:create', 'entities:update', 'entities:delete',
      'system:logs', 'system:settings',
    ],
    admin: [
      'reviews:create', 'reviews:read', 'reviews:update', 'reviews:delete', 'reviews:moderate',
      'users:view', 'users:ban',
      'entities:create', 'entities:update', 'entities:delete',
      'system:logs',
    ],
    moderator: [
      'reviews:read', 'reviews:update', 'reviews:delete', 'reviews:moderate',
      'users:view',
      'entities:read', // if you add a 'entities:read' permission
    ],
    user: [
      'reviews:create', 'reviews:read',
    ],
  };

  // 4. Insert role-permission links
  for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
    
    const roleId = roleMap.get(roleName);
    
    if (!roleId) {
      console.warn(` Role "${roleName}" not found, skipping permissions assignment.`);
      continue;
    }
    for (const permName of perms) {
      const permId = permMap.get(permName);
      
      if (!permId) {
        console.warn(` Permission "${permName}" not found, skipping.`);
        continue;
      }
      await db.insert(rolePermissions)
        .values({ roleId, permissionId: permId })
        .onConflictDoNothing(); // avoid duplicate entries
    }
  }

  console.log(' Roles and permissions seeded successfully.');
}

// Run if this script is executed directly
if (require.main === module) {
  seedRolesAndPermissions()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}

export { seedRolesAndPermissions };
