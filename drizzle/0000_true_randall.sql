CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_type` text NOT NULL,
	`readiness_stage` text NOT NULL,
	`platform` text NOT NULL,
	`industry` text NOT NULL,
	`name` text NOT NULL,
	`project_name` text,
	`email` text NOT NULL,
	`phone` text,
	`created_at` text NOT NULL
);
