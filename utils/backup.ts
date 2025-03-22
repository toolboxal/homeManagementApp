import * as FileSystem from 'expo-file-system'
import { shareAsync } from 'expo-sharing'
import db from '@/db/db'
import {
  storeItems,
  locations,
  spots,
  directions,
  shoppingList,
} from '@/db/schema'
import { format } from 'date-fns'
import * as Sharing from 'expo-sharing'
import { Alert } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'

// Type for the backup data structure
interface BackupData {
  timestamp: string
  version: string
  data: {
    locations: any[]
    spots: any[]
    directions: any[]
    storeItems: any[]
    shoppingList: any[]
  }
}

/**
 * Creates a backup of all app data and returns the path to the backup file
 */
export async function createBackup() {
  console.log('backup pressed')
  try {
    // Get data from all tables
    const locationsData = await db.select().from(locations)
    const spotsData = await db.select().from(spots)
    const directionsData = await db.select().from(directions)
    const storeItemsData = await db.select().from(storeItems)
    const shoppingListData = await db.select().from(shoppingList)

    // Create backup object
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      version: '1.0', // Increment this when backup format changes
      data: {
        locations: locationsData,
        spots: spotsData,
        directions: directionsData,
        storeItems: storeItemsData,
        shoppingList: shoppingListData,
      },
    }

    // Create filename with date
    const dateStr = format(new Date(), 'yyyy-MM-dd-HHmmss')
    const backupFileName = `homemanagement-backup-${dateStr}.json`

    // Use the standard FileSystem API which is more reliable for sharing
    const fileUri = `${FileSystem.documentDirectory}${backupFileName}`

    // Write the file
    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(backupData, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    )

    console.log(`Backup created at: ${fileUri}`)

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Share Home Management Backup',
        UTI: 'public.json',
      })
    } else {
      Alert.alert('Sharing is not available on this device')
    }
  } catch (error) {
    console.error('Backup failed:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    Alert.alert('Backup Failed', errorMessage)
  }
}

export async function restoreFromBackup() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    })
    if (result.assets === null) {
      throw new Error('Failed to open file')
    }

    const uri = result.assets[0].uri
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    })
    const backupData: BackupData = JSON.parse(fileContent)

    // Validate backup format
    if (!backupData.version || !backupData.data) {
      throw new Error('Invalid backup format')
    }

    // Start a transaction to ensure all-or-nothing restore
    await db.transaction(async (tx) => {
      // Clear existing data (in reverse order of dependencies)
      await tx.delete(shoppingList)
      await tx.delete(storeItems)
      await tx.delete(directions)
      await tx.delete(spots)
      await tx.delete(locations)

      // Restore data in order of dependencies
      if (backupData.data.locations?.length) {
        for (const item of backupData.data.locations) {
          await tx.insert(locations).values(item)
        }
      }

      if (backupData.data.spots?.length) {
        for (const item of backupData.data.spots) {
          await tx.insert(spots).values(item)
        }
      }

      if (backupData.data.directions?.length) {
        for (const item of backupData.data.directions) {
          await tx.insert(directions).values(item)
        }
      }

      if (backupData.data.storeItems?.length) {
        for (const item of backupData.data.storeItems) {
          await tx.insert(storeItems).values(item)
        }
      }

      if (backupData.data.shoppingList?.length) {
        for (const item of backupData.data.shoppingList) {
          await tx.insert(shoppingList).values(item)
        }
      }
    })

    console.log('Backup restored successfully')
    return 'success'
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Restore Error', error.message)
    }
  }
}
