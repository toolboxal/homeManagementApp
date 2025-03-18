PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_store_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date_bought` text NOT NULL,
	`date_expiry` text NOT NULL,
	`date_status_change` text DEFAULT '2025-03-17' NOT NULL,
	`cost` text DEFAULT '0' NOT NULL,
	`status` text DEFAULT 'active',
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
INSERT INTO `__new_store_items`("id", "name", "date_bought", "date_expiry", "date_status_change", "cost", "status", "quantity", "amount", "category", "location_id", "spot_id", "direction_id") SELECT "id", "name", "date_bought", "date_expiry", "date_status_change", "cost", "status", "quantity", "amount", "category", "location_id", "spot_id", "direction_id" FROM `store_items`;--> statement-breakpoint
DROP TABLE `store_items`;--> statement-breakpoint
ALTER TABLE `__new_store_items` RENAME TO `store_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;