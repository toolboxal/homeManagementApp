import * as SQLite from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from './schema'

export const expoDB = SQLite.openDatabaseSync('app.db')
expoDB.execSync('PRAGMA foreign_keys = ON;')

// Create the db instance first
const db = drizzle(expoDB, { schema, logger: true })

// // One-time reset of database tables to match the current schema
// try {
//   console.log('Dropping and recreating database tables...')

//   // Drop tables in reverse order of dependencies
//   expoDB.execSync('DROP TABLE IF EXISTS store_items')
//   expoDB.execSync('DROP TABLE IF EXISTS shopping_list')
//   expoDB.execSync('DROP TABLE IF EXISTS locations')
//   expoDB.execSync('DROP TABLE IF EXISTS spots')
//   expoDB.execSync('DROP TABLE IF EXISTS directions')

//   // Create tables based on schema
//   expoDB.execSync(`
//     CREATE TABLE IF NOT EXISTS locations (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       room TEXT NOT NULL UNIQUE
//     );

//     CREATE TABLE IF NOT EXISTS spots (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       spot TEXT NOT NULL UNIQUE
//     );

//     CREATE TABLE IF NOT EXISTS directions (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       direction TEXT NOT NULL UNIQUE
//     );

//     CREATE TABLE IF NOT EXISTS store_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       date_bought TEXT NOT NULL,
//       date_expiry TEXT NOT NULL,
//       date_status_change TEXT NOT NULL DEFAULT CURRENT_DATE,
//       cost TEXT NOT NULL DEFAULT '0',
//       status TEXT DEFAULT 'active',
//       expired INTEGER NOT NULL DEFAULT 0,
//       amount TEXT DEFAULT 'full',
//       category TEXT DEFAULT 'food',
//       location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
//       spot_id INTEGER REFERENCES spots(id) ON DELETE SET NULL ON UPDATE CASCADE,
//       direction_id INTEGER REFERENCES directions(id) ON DELETE SET NULL ON UPDATE CASCADE
//     );

//     CREATE TABLE IF NOT EXISTS shopping_list (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       done INTEGER DEFAULT 0
//     );
//   `)

//   console.log(
//     'Tables recreated successfully, database will be reseeded on next app start'
//   )
// } catch (error) {
//   console.error('Error resetting database:', error)
// }

export default db
