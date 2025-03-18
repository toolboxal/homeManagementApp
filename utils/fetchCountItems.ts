import db from '@/db/db'
import { storeItems } from '@/db/schema'
import { sql, and, gte, lte } from 'drizzle-orm'

export const fetchCountItems = async (
  startDateStr: string,
  endDateStr: string
) => {
  return await db
    .select({
      status: storeItems.status,
      count: sql`count(${storeItems.id})`.as('count'),
    })
    .from(storeItems)
    .where(
      and(
        gte(storeItems.dateStatusChange, startDateStr),
        lte(storeItems.dateStatusChange, endDateStr)
      )
    )
    .groupBy(storeItems.status)
    .execute()
}
