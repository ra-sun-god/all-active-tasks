# Project Setup & Usage

This project is built with **Fastify**, **Drizzle ORM**, and **SQLite**.

---

## 📦 Installation

```bash
npm install
```

---

## 🚀 Available Commands

### Development

```bash
npm run dev
```

* Runs the app in watch mode using `tsx`
* Pretty-prints logs with `pino-pretty`

### Start (Production-like)

```bash
npm start
```

* Starts Fastify server via CLI

---

### 🧪 Testing

```bash
npm test
```

* Runs tests using Vitest

---

### 🗄️ Database Commands

#### Generate Migrations

```bash
npm run db:generate
```

#### Run Migrations

```bash
npm run db:migrate
```

* Generates + applies migrations

#### Seed Database

```bash
npm run db:seed
```

* Inserts predefined users into the database

---

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
