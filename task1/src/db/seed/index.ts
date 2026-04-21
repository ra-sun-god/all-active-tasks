import { seedRolesAndPermissions } from './roles-permissions';
import { seedEntities } from './entities';
import { seedSuperAdmin } from './super-admin';

async function seedAll() {
  console.log('Starting database seeding...\n');

  //  Roles and permissions (must come first, because super admin needs roles)
  await seedRolesAndPermissions();

  //  Sample entities (optional, for development)
  await seedEntities();

  //Super admin user (depends on roles)
  await seedSuperAdmin();

  console.log('\nAll seeding completed successfully.');
}

// Run if executed directly
if (require.main === module) {
  seedAll()
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

export { seedAll };
