import db from '@/db/db'
import { storeItems } from '@/db/schema'
import { desc, asc, eq, not } from 'drizzle-orm'

export const fetchNonActiveItems = async () => {
  return await db.query.storeItems.findMany({
    where: not(eq(storeItems.status, 'active')),
    orderBy: [
      asc(storeItems.status),
      desc(storeItems.dateBought),
    ],
  })
}
