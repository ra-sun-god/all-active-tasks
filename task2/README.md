

## Demo 

- url: ()[https://task2.libertypie.com]

- Frontend deployed on Cloudflare Pages 
- Backend deployed on my VPS

### Public List example (no login)
- (https://task2.libertypie.com/public/f10925ed-d6d7-4a41-9875-b2d7a9932cec)[https://task2.libertypie.com/public/f10925ed-d6d7-4a41-9875-b2d7a9932cec]

### Public collection example (no login)
- (https://task2.libertypie.com/public/collection/c78dd1bb-2a72-401b-834c-e6e2a7b04422)[https://task2.libertypie.com/public/collection/c78dd1bb-2a72-401b-834c-e6e2a7b04422]


Login and Passwords Below

## 👤 Seeded Users (Development Only)

| Name    | Email                                             | Password         |
| ------- | ------------------------------------------------- | ---------------- |
| Alice   | [alice@example.com](mailto:alice@example.com)     | V9!kL2#pQ7@xR4mT |
| Bob     | [bob@example.com](mailto:bob@example.com)         | Z3@fH8!nW5$yK1qP |
| Charlie | [charlie@example.com](mailto:charlie@example.com) | T7^mC2#X9!vB4rL  |
| Diana   | [diana@example.com](mailto:diana@example.com)     | P5!zQ8@L3^sN6wXK |
| Edward  | [edward@example.com](mailto:edward@example.com)   | M4@kR9!tY2#bH7Vp |

⚠️ **Important:**

* Passwords are hashed using Argon2 before storage
* These credentials are for **development/testing only**
* Do NOT use in production

---

## ⚙️ Tech Stack

* Fastify
* Drizzle ORM
* SQLite (better-sqlite3 / libsql)
* Argon2 (password hashing)
* Vitest (testing)

---

## 💡 Tips

* Run migrations before seeding:

  ```bash
  npm run db:migrate
  npm run db:seed
  ```
* Use `.env` for secrets and configuration
* Consider rotating or generating passwords dynamically for better security

---
