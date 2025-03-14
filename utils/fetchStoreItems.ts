import db from '@/db/db'
import { storeItems } from '@/db/schema'
import { desc, asc, eq, and } from 'drizzle-orm'

export const fetchStoreItems = async (selectedRoomId: number) => {
  if (selectedRoomId === 99999) {
    return await db.query.storeItems.findMany({
      where: eq(storeItems.status, 'active'),
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
      where: and(
        eq(storeItems.locationId, selectedRoomId),
        eq(storeItems.status, 'active')
      ),
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
