import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const memorialPages = sqliteTable(
  "memorial_pages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    publicId: text("public_id").unique(),
    slug: text("slug").notNull().unique(),
    fullName: text("full_name").notNull(),
    birthDate: text("birth_date").notNull(),
    deathDate: text("death_date").notNull(),
    epitaph: text("epitaph"),
    biography: text("biography"),
    coverPhoto: text("cover_photo"),
    galleryImages: text("gallery_images").notNull().default("[]"),
    videoUrls: text("video_urls").notNull().default("[]"),
    cemeteryLocation: text("cemetery_location"),
    qrCodePngPath: text("qr_code_png_path"),
    qrCodeSvgPath: text("qr_code_svg_path"),
    qrTargetUrl: text("qr_target_url"),
    qrGeneratedAt: integer("qr_generated_at", { mode: "timestamp" }),
    qrVersion: integer("qr_version").notNull().default(0),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("memorial_public_id_idx").on(table.publicId),
    index("memorial_slug_idx").on(table.slug),
    index("memorial_published_idx").on(table.isPublished),
  ],
);

export type User = typeof users.$inferSelect;
export type MemorialPage = typeof memorialPages.$inferSelect;
export type NewMemorialPage = typeof memorialPages.$inferInsert;
