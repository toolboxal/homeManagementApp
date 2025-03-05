CREATE TABLE `directions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`direction` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `directions_direction_unique` ON `directions` (`direction`);--> statement-breakpoint
CREATE TABLE `spots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`spot` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spots_spot_unique` ON `spots` (`spot`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_store_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date_bought` text NOT NULL,
	`date_expiry` text NOT NULL,
	`cost` text DEFAULT '0' NOT NULL,
	`consumed` integer DEFAULT false,
	`quantity` text DEFAULT '1' NOT NULL,
	`amount` text DEFAULT 'full',
	`category` text DEFAULT 'food',
	`location_id` integer,
	`spot_id` integer,
	`direction_id` integer,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`spot_id`) REFERENCES `spots`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`direction_id`) REFERENCES `directions`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_store_items`("id", "name", "date_bought", "date_expiry", "cost", "consumed", "quantity", "amount", "category", "location_id", "spot_id", "direction_id") SELECT "id", "name", "date_bought", "date_expiry", "cost", "consumed", "quantity", "amount", "category", "location_id", "spot_id", "direction_id" FROM `store_items`;--> statement-breakpoint
DROP TABLE `store_items`;--> statement-breakpoint
ALTER TABLE `__new_store_items` RENAME TO `store_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `locations_room_unique` ON `locations` (`room`);