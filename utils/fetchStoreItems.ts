import db from '@/db/db'
import { storeItems } from '@/db/schema'
import { format } from 'date-fns'
import { desc, asc, eq, and, sql } from 'drizzle-orm'

export const fetchStoreItems = async (selectedRoomId?: number) => {
  const currentDate = format(new Date(), 'yyyy-MM-dd')

  await db
    .update(storeItems)
    .set({ expired: true })
    .where(
      sql`${storeItems.dateExpiry} <= ${currentDate} AND ${storeItems.expired} = false`
    )

  await db
    .update(storeItems)
    .set({ expired: false })
    .where(
      sql`${storeItems.dateExpiry} >= ${currentDate} AND ${storeItems.expired} = true`
    )

  if (selectedRoomId === 99999 || !selectedRoomId) {
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
