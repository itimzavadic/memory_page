ALTER TABLE `memorial_pages` ADD `hero_tagline` text DEFAULT 'С любовью светлая память';
--> statement-breakpoint
ALTER TABLE `memorial_pages` ADD `content_blocks` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `memorial_pages` ADD `cemetery_lat` text;
--> statement-breakpoint
ALTER TABLE `memorial_pages` ADD `cemetery_lng` text;
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_text` text,
	`partners_json` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `site_settings` (`company_text`, `partners_json`, `updated_at`)
VALUES ('mp_vobraz — страницы светлой памяти', '[]', unixepoch());
