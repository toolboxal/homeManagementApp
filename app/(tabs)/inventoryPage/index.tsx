import { useMemo, useState, useEffect } from 'react'
import { Stack } from 'expo-router'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import db from '@/db/db'
import { locations, storeItems, TStoreItemSelect } from '@/db/schema'
import { blue, gray, brown, green, red } from '@/constants/colors'
import { bitter, poppins, size } from '@/constants/fonts'
import RoomListScroll from '@/components/inventory/RoomListScroll'
import { fetchStoreItems } from '@/utils/fetchStoreItems'
import { capitalize } from '@/utils/capitalize'
import { asc } from 'drizzle-orm'
import { formatDistance } from 'date-fns'
import ItemModal from '@/components/inventory/ItemModal'
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated'

export type TData = TStoreItemSelect & {
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

const amountAlertColors = {
  empty: brown[300],
  low: brown[100],
  half: green[100],
  full: green[300],
}

const InventoryPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number>(99999)
  const [groupedByLocation, setGroupedByLocation] = useState<GroupedItems>([])
  const [openItemModal, setOpenItemModal] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<TData | null>(null)
  const [searchBarQuery, setSearchBarQuery] = useState<string>('')

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

    const searchedItem = storeItemsList.filter((item) => {
      return item.name.toLowerCase().includes(searchBarQuery.toLowerCase())
    })
    // console.log(searchedItem)

    // Group items by location.room
    const groupedData = searchedItem.reduce<Record<string, TData[]>>(
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
  }, [storeItemsList, searchBarQuery])

  const completedRoomList = useMemo(
    () => [{ id: 99999, room: 'all_rooms' }, ...(roomList || [])],
    [roomList]
  )

  function calcDaysLeft(date: string) {
    const today = new Date()
    const dateResult = formatDistance(today, new Date(date))
    return dateResult
  }

  return (
    <Animated.ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
      layout={LinearTransition.springify()}
    >
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            onChangeText: (event) => {
              const text = event.nativeEvent.text
              setSearchBarQuery(text)
              // console.log(text)
            },
            onCancelButtonPress: () => {
              setSearchBarQuery('')
            },
          },
        }}
      />
      <RoomListScroll
        selectedRoomId={selectedRoomId}
        setSelectedRoomId={setSelectedRoomId}
        roomList={completedRoomList || []}
      />

      {groupedByLocation.length > 0 ? (
        <Animated.View
          style={styles.groupContainer}
          entering={FadeInDown.springify()}
          exiting={FadeOutUp.springify()}
          layout={LinearTransition.springify()}
        >
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
                        paddingHorizontal: 5,
                        borderRadius: 2,
                        backgroundColor: amountAlertColors[item.amount!],
                      }}
                    >
                      <Text
                        style={[
                          styles.itemName,
                          { fontSize: size.xxs, color: gray[700] },
                        ]}
                      >
                        {item.amount}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.itemName,
                        { fontSize: size.xs, color: gray[400] },
                      ]}
                    >
                      {item.category === 'food'
                        ? 'Expires in: ' + calcDaysLeft(item.dateExpiry)
                        : 'To replace in: ' + calcDaysLeft(item.dateExpiry)}
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
        </Animated.View>
      ) : (
        <Animated.View
          style={styles.emptyState}
          entering={FadeInDown.springify()}
          exiting={FadeOutUp.springify()}
          layout={LinearTransition.springify()}
        >
          <Text style={styles.emptyStateText}>No items found</Text>
        </Animated.View>
      )}
      <ItemModal
        selectedItem={selectedItem}
        openItemModal={openItemModal}
        setOpenItemModal={setOpenItemModal}
      />
    </Animated.ScrollView>
  )
}

export default InventoryPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
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
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
