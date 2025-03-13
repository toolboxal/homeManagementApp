import db from './db'
import { sql } from 'drizzle-orm'
import { directions, locations, spots, storeItems, TStoreItem } from './schema'

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

const seedDirections = [
  { direction: 'top' },
  { direction: 'bottom' },
  { direction: 'left' },
  { direction: 'right' },
  { direction: 'front' },
  { direction: 'back' },
  { direction: 'middle' },
  { direction: 'inside' },
  { direction: 'outside' },
  { direction: 'beside' },
  { direction: '1st' },
  { direction: '2nd' },
  { direction: '3rd' },
]

const seedSpots = [
  { spot: 'cabinet' },
  { spot: 'drawer' },
  { spot: 'shelf' },
  { spot: 'counter' },
  { spot: 'fridge' },
  { spot: 'freezer' },
  { spot: 'pantry' },
  { spot: 'closet' },
  { spot: 'box' },
  { spot: 'basket' },
  { spot: 'container' },
  { spot: 'rack' },
]

export const seedDatabase = async () => {
  const countLocations = await db
    .select({ count: sql<number>`count(*)` })
    .from(locations)
  if (countLocations[0].count === 0) {
    console.log('Seeding rooms...')
    await db.insert(locations).values(seedRooms)
    console.log('Seeding rooms complete!')
  }
  const countSpots = await db
    .select({ count: sql<number>`count(*)` })
    .from(spots)
  if (countSpots[0].count === 0) {
    console.log('Seeding spots...')
    await db.insert(spots).values(seedSpots)
    console.log('Seeding spots complete!')
  }
  const countDirections = await db
    .select({ count: sql<number>`count(*)` })
    .from(directions)
  if (countDirections[0].count === 0) {
    console.log('Seeding directions...')
    await db.insert(directions).values(seedDirections)
    console.log('Seeding directions complete!')
  }
  const [locationsArr, directionArr, spotArr] = await Promise.all([
    db.select().from(locations),
    db.select().from(directions),
    db.select().from(spots),
  ])

  const seedItems: TStoreItem[] = [
    {
      name: 'Maiji Dark Chocolate',
      dateBought: '2024-12-20',
      dateExpiry: '2025-06-14',
      cost: '3.50',
      status: 'active',
      quantity: '1',
      amount: 'full',
      category: 'food',
      directionId: directionArr[0].id,
      spotId: spotArr[0].id,
      locationId: locationsArr[0].id,
    },
    {
      name: 'Can Tuna',
      dateBought: '2025-02-07',
      dateExpiry: '2027-01-20',
      cost: '1.99',
      status: 'active',
      quantity: '1',
      amount: 'full',
      category: 'food',
      directionId: directionArr[6].id,
      spotId: spotArr[2].id,
      locationId: locationsArr[6].id,
    },
    {
      name: 'Toilet Paper',
      dateBought: '2024-11-02',
      dateExpiry: '2026-04-10',
      cost: '8.35',
      status: 'active',
      quantity: '8',
      amount: 'full',
      category: 'supplies',
      directionId: directionArr[10].id,
      spotId: spotArr[7].id,
      locationId: locationsArr[3].id,
    },
    {
      name: 'Plant fertilizer',
      dateBought: '2024-05-23',
      dateExpiry: '2026-01-15',
      cost: '2.70',
      status: 'active',
      quantity: '1',
      amount: 'full',
      category: 'miscellaneous',
      directionId: directionArr[1].id,
      spotId: spotArr[8].id,
      locationId: locationsArr[6].id,
    },
  ]

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
  const allSpots = await db.select().from(spots)
  const allDirections = await db.select().from(directions)
  // const roomsSet = [...new Set(allLocations.map((l) => l.room))]
  // const spotsSet = [...new Set(allSpots.map((s) => s.spot))]
  // const directionsSet = [...new Set(allDirections.map((d) => d.direction))]

  return { allLocations, allSpots, allDirections }
}
