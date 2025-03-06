import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'
import { z } from 'zod'

export const locations = sqliteTable('locations', {
  id: int('id').primaryKey({ autoIncrement: true }),
  room: text('room').notNull().unique(),
})

export const locationsRelations = relations(locations, ({ many }) => ({
  items: many(storeItems),
}))

export const spots = sqliteTable('spots', {
  id: int('id').primaryKey({ autoIncrement: true }),
  spot: text('spot').notNull().unique(),
})

export const spotsRelations = relations(spots, ({ many }) => ({
  items: many(storeItems),
}))

export const directions = sqliteTable('directions', {
  id: int('id').primaryKey({ autoIncrement: true }),
  direction: text('direction').notNull().unique(),
})
export const directionsRelations = relations(directions, ({ many }) => ({
  items: many(storeItems),
}))

export const storeItems = sqliteTable('store_items', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  dateBought: text('date_bought').notNull(),
  dateExpiry: text('date_expiry').notNull(),
  cost: text('cost').notNull().default('0'),
  consumed: int('consumed', { mode: 'boolean' }).default(false),
  quantity: text('quantity').notNull().default('1'),
  amount: text('amount', { enum: ['empty', 'low', 'half', 'full'] }).default(
    'full'
  ),
  category: text('category', {
    enum: ['food', 'hygiene', 'supplies', 'miscellaneous'],
  }).default('food'),
  locationId: int('location_id').references(() => locations.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  spotId: int('spot_id').references(() => spots.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  directionId: int('direction_id').references(() => directions.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
})

export const storeItemsRelations = relations(storeItems, ({ one }) => ({
  location: one(locations, {
    fields: [storeItems.locationId],
    references: [locations.id],
  }),
  spot: one(spots, {
    fields: [storeItems.spotId],
    references: [spots.id],
  }),
  direction: one(directions, {
    fields: [storeItems.directionId],
    references: [directions.id],
  }),
}))

export const locationInsertSchema = createInsertSchema(locations)
export const spotInsertSchema = createInsertSchema(spots)
export const directionInsertSchema = createInsertSchema(directions)

export const storeItemsInsertSchema = createInsertSchema(storeItems, {
  name: (schema) =>
    schema
      .min(1, { message: 'Name cannot be blank' })
      .max(40, { message: 'Exceeds max length' }),
  quantity: (schema) =>
    schema
      .regex(/^[1-9]\d*$/, { message: 'Invalid quantity' })
      .min(1, { message: 'Minimum 1 quantity' })
      .default('1'),
  cost: (schema) =>
    schema.regex(/^(?:\d+(?:[.,]\d{0,2})?|[.,]\d{1,2})$/, {
      message: 'Invalid cost',
    }),
}).pick({
  id: true,
  name: true,
  dateBought: true,
  dateExpiry: true,
  cost: true,
  quantity: true,
  amount: true,
  category: true,
  locationId: true,
  spotId: true,
  directionId: true,
})

export type TLocation = z.infer<typeof locationInsertSchema>
export type TSpot = z.infer<typeof spotInsertSchema>
export type TDirection = z.infer<typeof directionInsertSchema>
export type TStoreItem = z.infer<typeof storeItemsInsertSchema>
