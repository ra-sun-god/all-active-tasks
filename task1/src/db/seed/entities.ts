import { db } from '../database';
import { entities } from '../schema/entities';
import { sql } from 'drizzle-orm';

export async function seedEntities() {
  console.log('Seeding 5 sample entities...');

  const sampleEntities = [
    { name: 'Joe\'s Coffee Shop', email: 'contact@joescoffee.com' },
    { name: 'The Book Nook', email: 'hello@booknook.com' },
    { name: 'Tech Repair Hub', email: 'support@techrepairhub.com' },
    { name: 'Green Leaf Restaurant', email: 'info@greenleaf.com' },
    { name: 'Fitness First Gym', email: 'membership@fitnessfirst.com' },
  ];

  for (const entity of sampleEntities) {
    await db.insert(entities)
      .values({
        name: entity.name,
        email: entity.email,
        // avgRating and reviewCount default to 0 via schema
      })
      .onConflictDoNothing({ target: entities.email }); // avoids duplicates
  }

  const count = await db.select({ count: sql<number>`count(*)` }).from(entities);
  console.log(`Seeded ${sampleEntities.length} entities. Total in DB: ${count[0].count}`);
}

// Run directly if needed
if (require.main === module) {
  seedEntities()
    .catch(console.error)
    .finally(() => process.exit(0));
}
