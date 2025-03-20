import db from './db'
import { sql } from 'drizzle-orm'
import {
  directions,
  locations,
  shoppingList,
  spots,
  storeItems,
  TShoppingListInsert,
  TStoreItemInsert,
} from './schema'

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
  { room: 'children_room' },
]

const seedDirections = [
  { direction: 'top' },
  { direction: 'bottom' },
  { direction: 'left' },
  { direction: 'right' },
  { direction: 'front' },
  { direction: 'behind' },
  { direction: 'middle' },
  { direction: 'inside' },
  { direction: 'outside' },
  { direction: 'beside' },
  { direction: '1st' },
  { direction: '2nd' },
  { direction: '3rd' },
  { direction: 'on' },
  { direction: 'against' },
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
  { spot: 'table' },
  { spot: 'door' },
  { spot: 'wall' },
  { spot: 'corner' },
]

const seedShoppingList: TShoppingListInsert[] = [
  { name: 'A loaf of bread' },
  { name: 'Brand XYZ Detergent' },
  { name: 'AAA batteries' },
  { name: 'Chocolate Ice cream' },
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

  const seedItems: TStoreItemInsert[] = [
    {
      name: 'Moiji dark chocolate',
      dateBought: '2025-01-14',
      dateExpiry: '2025-06-10',
      cost: '3.50',
      category: 'food',
      directionId: directionArr[0].id,
      spotId: spotArr[0].id,
      locationId: locationsArr[0].id,
    },
    {
      name: 'Can tuna',
      dateBought: '2025-02-07',
      dateExpiry: '2027-01-20',
      cost: '1.99',
      category: 'food',
      directionId: directionArr[6].id,
      spotId: spotArr[2].id,
      locationId: locationsArr[6].id,
    },
    {
      name: 'Tissue paper',
      dateBought: '2024-11-02',
      dateExpiry: '2026-04-10',
      cost: '8.35',
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
      category: 'miscellaneous',
      directionId: directionArr[1].id,
      spotId: spotArr[8].id,
      locationId: locationsArr[6].id,
    },
    {
      name: 'Shaving cream',
      dateBought: '2025-03-03',
      dateExpiry: '2026-06-05',
      cost: '2.70',
      category: 'hygiene',
      directionId: directionArr[0].id,
      spotId: spotArr[0].id,
      locationId: locationsArr[2].id,
    },
    {
      name: 'Scented candles',
      dateBought: '2025-03-11',
      dateExpiry: '2026-03-30',
      cost: '15.00',
      category: 'miscellaneous',
      directionId: directionArr[13].id,
      spotId: spotArr[12].id,
      locationId: locationsArr[7].id,
    },
    {
      name: 'Cat food',
      dateBought: '2025-01-18',
      dateExpiry: '2025-10-05',
      cost: '7.35',
      category: 'miscellaneous',
      directionId: directionArr[6].id,
      spotId: spotArr[9].id,
      locationId: locationsArr[3].id,
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

  // const countShoppingList = await db
  //   .select({ count: sql<number>`count(*)` })
  //   .from(shoppingList)
  // if (countShoppingList[0].count === 0) {
  //   console.log('Seeding shopping list...')
  //   await db.insert(shoppingList).values(seedShoppingList)
  //   console.log('Seeding shopping list complete!')
  // }
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
