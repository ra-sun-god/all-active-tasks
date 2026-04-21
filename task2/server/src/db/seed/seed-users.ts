import { db } from "../index"; 
import { users } from "../schema/users";
import { hashPassword } from "../../utils/hash";
import { randomUUID } from "crypto";

async function seedUsers() {
  const seedUsers = [
    { email: "alice@example.com", name: "Alice", password: "V9!kL2#pQ7@xR4mT" },
    { email: "bob@example.com", name: "Bob", password: "Z3@fH8!nW5$yK1qP" },
    { email: "charlie@example.com", name: "Charlie", password: "T7^mC2#X9!vB4rL" },
    { email: "diana@example.com", name: "Diana", password: "P5!zQ8@L3^sN6wXK" },
    { email: "edward@example.com", name: "Edward", password: "M4@kR9!tY2#bH7Vp" },
  ];

  const data = await Promise.all(
    seedUsers.map(async (u) => ({
      id: randomUUID(),
      email: u.email,
      name: u.name,
      passwordHash: await hashPassword(u.password),
    }))
  );

  await db.insert(users).values(data);

  console.log("Seeded 5 users with strong passwords");
}

seedUsers().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
