import * as SQLite from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from './schema'

export const expoDB = SQLite.openDatabaseSync('app.db')
expoDB.execSync('PRAGMA foreign_keys = ON;')

const db = drizzle(expoDB, { schema })

export default db
