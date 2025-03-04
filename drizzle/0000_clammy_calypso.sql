CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `store_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date_bought` text NOT NULL,
	`date_expiry` text NOT NULL,
	`cost` text DEFAULT '0' NOT NULL,
	`consumed` integer DEFAULT false,
	`quantity` text DEFAULT '1' NOT NULL,
	`amount` text DEFAULT 'full',
	`category` text DEFAULT 'food',
	`direction` text NOT NULL,
	`spot` text NOT NULL,
	`location_id` integer,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
