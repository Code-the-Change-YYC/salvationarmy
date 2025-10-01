CREATE TABLE `form` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`submitted_by_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') as integer)) NOT NULL,
	FOREIGN KEY (`submitted_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
