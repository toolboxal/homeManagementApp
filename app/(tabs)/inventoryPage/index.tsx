import { useMemo, useState, useEffect } from 'react'
import { StyleSheet, Text, ScrollView, View, Pressable } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import db from '@/db/db'
import { locations, storeItems, TStoreItem } from '@/db/schema'
import { blue, gray, brown, green } from '@/constants/colors'
import { bitter, poppins, size } from '@/constants/fonts'
import RoomListScroll from '@/components/inventory/RoomListScroll'
import { fetchStoreItems } from '@/utils/fetchStoreItems'
import { capitalize } from '@/utils/capitalize'
import { asc, desc } from 'drizzle-orm'
import { format } from 'date-fns'
import ItemModal from '@/components/inventory/ItemModal'

export type TData = TStoreItem & {
  location: {
    id: number
    room: string
  } | null
  spot: {
    id: number
    spot: string
  } | null
  direction: {
    id: number
    direction: string
  } | null
}

// Define our grouped data structure
type GroupedItems = Array<[string, TData[]]>

const categoryColor = {
  food: brown[100],
  hygiene: green[100],
  supplies: blue[100],
  miscellaneous: gray[100],
}

const InventoryPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number>(99999)
  const [groupedByLocation, setGroupedByLocation] = useState<GroupedItems>([])
  const [openItemModal, setOpenItemModal] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<TData | null>(null)

  const { data: roomList } = useQuery({
    queryKey: ['location', 'rooms'],
    queryFn: async () => {
      return await db.query.locations.findMany({
        orderBy: [asc(locations.room)],
      })
    },
    // staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: storeItemsList, isLoading } = useQuery({
    queryKey: ['store_items', selectedRoomId],
    queryFn: () => fetchStoreItems(selectedRoomId),
    // staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Process the storeItemsList to group by location.room
  useEffect(() => {
    if (!storeItemsList) {
      setGroupedByLocation([])
      return
    }

    // Group items by location.room
    const groupedData = storeItemsList.reduce<Record<string, TData[]>>(
      (acc, item) => {
        // Use the location room or 'Unassigned' if location is null
        const locationName = item.location?.room || 'Unassigned'

        // Initialize the array for this location if it doesn't exist
        if (!acc[locationName]) {
          acc[locationName] = []
        }

        // Add the current item to its location group
        acc[locationName].push(item)
        return acc
      },
      {}
    )
    // Convert the grouped data object to an array of [locationName, items] pairs
    const groupedArray = Object.entries(groupedData)

    // Sort by location name (but keep 'Unassigned' at the end)
    groupedArray.sort((a, b) => {
      if (a[0] === 'Unassigned') return 1
      if (b[0] === 'Unassigned') return -1
      return a[0].localeCompare(b[0])
    })

    setGroupedByLocation(groupedArray)
  }, [storeItemsList])

  const completedRoomList = useMemo(
    () => [{ id: 99999, room: 'all_rooms' }, ...(roomList || [])],
    [roomList]
  )

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
    >
      <RoomListScroll
        selectedRoomId={selectedRoomId}
        setSelectedRoomId={setSelectedRoomId}
        roomList={completedRoomList || []}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      ) : groupedByLocation.length > 0 ? (
        <View style={styles.groupContainer}>
          {groupedByLocation.map(([locationName, items]) => (
            <View key={locationName} style={styles.locationGroup}>
              <Text style={styles.locationHeader}>
                {capitalize(locationName)}
              </Text>
              {items.map((item, itemIndex) => (
                <Pressable
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => {
                    setSelectedItem(item)
                    setOpenItemModal(true)
                  }}
                >
                  <View style={styles.itemDetailsBox}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View
                      style={{
                        flex: 1,
                        padding: 3,
                        borderRadius: 4,
                        backgroundColor: categoryColor[item.category!],
                      }}
                    >
                      <Text
                        style={[
                          styles.itemName,
                          { fontSize: size.xs, color: gray[400] },
                        ]}
                      >
                        {item.category}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.itemName,
                        { fontSize: size.xs, color: gray[400] },
                      ]}
                    >
                      {'date bought: ' + format(item.dateBought, 'dd MMM yy')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.itemDetailsBox,
                      {
                        alignItems: 'flex-end',
                        padding: 3,
                        height: 50,
                        gap: 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemName,
                        { fontSize: size.xs, color: blue[600] },
                      ]}
                    >
                      {item.direction?.direction || 'Unassigned'}
                    </Text>
                    <Text
                      style={[
                        styles.itemName,
                        { fontSize: size.xs, color: blue[600] },
                      ]}
                    >
                      {item.spot?.spot || 'Unassigned'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No items found</Text>
        </View>
      )}
      <ItemModal
        selectedItem={selectedItem}
        openItemModal={openItemModal}
        setOpenItemModal={setOpenItemModal}
      />
    </ScrollView>
  )
}

export default InventoryPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: gray[50],
  },
  title: {
    fontFamily: poppins.Bold,
    fontSize: size.xl,
    color: blue[900],
    marginBottom: 16,
  },
  groupContainer: {
    marginTop: 10,
  },
  locationGroup: {
    marginBottom: 20,
    // borderColor: 'red',
    // borderWidth: 1,
  },
  locationHeader: {
    fontFamily: bitter.SemiBold,
    fontSize: size.xl,
    color: blue[600],
    paddingVertical: 8,
    // borderBottomWidth: 1,
    // borderBottomColor: blue[300],
    marginBottom: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 4,
  },
  itemName: {
    fontFamily: poppins.Medium,
    fontSize: size.sm,
    color: gray[900],
  },
  itemDetailsBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    // backgroundColor: 'yellow',
    gap: 2,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: gray[500],
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: gray[500],
  },
})
