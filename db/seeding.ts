import db from './db'
import { sql } from 'drizzle-orm'
import { locations, storeItems, TLocation, TStoreItem } from './schema'

const defaultLocations = [
  { room: 'balcony', direction: 'top', noun: 'shelf' },
  { room: 'kitchen', direction: 'beside', noun: 'fridge' },
  { room: 'bathroom', direction: 'under', noun: 'sink' },
  { room: 'store_room', direction: 'top', noun: 'cabinet' },
  { room: 'laundry', direction: 'above', noun: 'washer' },
  { room: 'pantry', direction: '1st', noun: 'shelf' },
  { room: 'garage', direction: 'left', noun: 'rack' },
  { room: 'master_bedroom', direction: 'under', noun: 'bed' },
  { room: 'study_room', direction: 'right', noun: 'corner' },
]
const seedRooms = [
  { room: 'kitchen' },
  { room: 'pantry' },
  { room: 'bathroom' },
  { room: 'store_room' },
  { room: 'laundry' },
  { room: 'balcony' },
  { room: 'garage' },
  { room: 'master_bedroom' },
  { room: 'study_room' },
  { room: 'guest_room' },
]
const seedItems: TStoreItem[] = [
  {
    name: 'Maiji Dark Chocolate',
    dateBought: '2024-12-20',
    dateExpiry: '2025-06-14',
    cost: '3.50',
    quantity: '1',
    amount: 'full',
    category: 'food',
    direction: 'inside',
    spot: 'fridge',
    locationId: 1,
  },
  {
    name: 'Can Tuna',
    dateBought: '2025-02-07',
    dateExpiry: '2027-01-20',
    cost: '1.99',
    quantity: '1',
    amount: 'full',
    category: 'food',
    direction: '1st',
    spot: 'cabinet',
    locationId: 2,
  },
]

export const seedDatabase = async () => {
  const countLocation = await db
    .select({ count: sql<number>`count(*)` })
    .from(locations)
  if (countLocation[0].count === 0) {
    console.log('Seeding rooms...')
    await db.insert(locations).values(seedRooms)
    console.log('Seeding rooms complete!')
  }
  const countItems = await db
    .select({ count: sql<number>`count(*)` })
    .from(storeItems)
  if (countItems[0].count === 0) {
    console.log('Seeding items...')
    await db.insert(storeItems).values(seedItems)
    console.log('Seeding items complete!')
  }
}

export const getTagOptions = async () => {
  const allLocations = await db.select().from(locations)
  const rooms = [...new Set(allLocations.map((l) => l.room))]

  return { rooms }
}
