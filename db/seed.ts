import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

async function seed() {
  const email = process.env.ADMIN_EMAIL ?? "admin@mp-vobraz.local";
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({ email, passwordHash });

  console.log(`Admin user created: ${email}`);
  console.log("Change the default password after first login.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
