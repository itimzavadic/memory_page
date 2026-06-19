CREATE TABLE `memorial_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text,
	`slug` text NOT NULL,
	`full_name` text NOT NULL,
	`birth_date` text NOT NULL,
	`death_date` text NOT NULL,
	`epitaph` text,
	`biography` text,
	`cover_photo` text,
	`gallery_images` text DEFAULT '[]' NOT NULL,
	`video_urls` text DEFAULT '[]' NOT NULL,
	`cemetery_location` text,
	`qr_code_png_path` text,
	`qr_code_svg_path` text,
	`qr_target_url` text,
	`qr_generated_at` integer,
	`qr_version` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `memorial_pages_public_id_unique` ON `memorial_pages` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `memorial_pages_slug_unique` ON `memorial_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `memorial_public_id_idx` ON `memorial_pages` (`public_id`);--> statement-breakpoint
CREATE INDEX `memorial_slug_idx` ON `memorial_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `memorial_published_idx` ON `memorial_pages` (`is_published`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);