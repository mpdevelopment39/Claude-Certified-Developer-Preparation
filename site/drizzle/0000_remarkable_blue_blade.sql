CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`mode` text NOT NULL,
	`domain_id` text,
	`title` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL,
	`duration_seconds` integer NOT NULL,
	`elapsed_seconds` integer NOT NULL,
	`question_count` integer NOT NULL,
	`answered_count` integer NOT NULL,
	`correct_count` integer NOT NULL,
	`score_percent` integer NOT NULL,
	`domain_results` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_exam_attempts_device_completed` ON `exam_attempts` (`device_id`,`completed_at`);