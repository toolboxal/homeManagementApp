import db from '@/db/db'
import { storeItems } from '@/db/schema'
import { desc, asc } from 'drizzle-orm'

export const fetchStoreItems = async (selectedRoomId: number) => {
  if (selectedRoomId === 99999) {
    return await db.query.storeItems.findMany({
      orderBy: [
        asc(storeItems.locationId),
        desc(storeItems.spotId),
        desc(storeItems.directionId),
        desc(storeItems.dateBought),
      ],
      with: {
        location: true,
        spot: true,
        direction: true,
      },
    })
  } else {
    return await db.query.storeItems.findMany({
      where: (storeItems, { eq }) => eq(storeItems.locationId, selectedRoomId),
      orderBy: [
        asc(storeItems.locationId),
        desc(storeItems.spotId),
        desc(storeItems.directionId),
        desc(storeItems.dateBought),
      ],
      with: {
        location: true,
        spot: true,
        direction: true,
      },
    })
  }
}
