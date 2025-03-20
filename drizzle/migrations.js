// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json'
import m0000 from './0000_clammy_calypso.sql'
import m0001 from './0001_organic_marvel_apes.sql'
import m0002 from './0002_friendly_toxin.sql'
import m0003 from './0003_blue_roland_deschain.sql'
import m0004 from './0004_brave_switch.sql'
import m0005 from './0005_many_rocket_racer.sql'

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
  },
}
