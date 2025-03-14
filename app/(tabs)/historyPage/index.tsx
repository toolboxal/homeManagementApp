import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import db from '@/db/db'
import { storeItems, TStoreItemSelect } from '@/db/schema'
import { blue, brown, gray, green } from '@/constants/colors'
import { bitter, poppins, size } from '@/constants/fonts'
import { fetchNonActiveItems } from '@/utils/fetchNonActiveItems'
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated'
import { capitalize } from '@/utils/capitalize'

type GroupedItems = Array<[string, TStoreItemSelect[]]>

const amountAlertColors = {
  empty: brown[300],
  low: brown[100],
  half: green[100],
  full: green[300],
}

const HistoryPage = () => {
  const [groupedByStatus, setGroupedByStatus] = useState<GroupedItems>([])
  const [searchBarQuery, setSearchBarQuery] = useState<string>('')

  const { data: storeItemsList } = useQuery({
    queryKey: ['history'],
    queryFn: fetchNonActiveItems,
  })
  console.log(storeItemsList)

  useEffect(() => {
    if (!storeItemsList) {
      setGroupedByStatus([])
      return
    }

    const searchedItem = storeItemsList.filter((item) => {
      return item.name.toLowerCase().includes(searchBarQuery.toLowerCase())
    })

    const groupedData = searchedItem.reduce<Record<string, TStoreItemSelect[]>>(
      (acc, item) => {
        // Use the location room or 'Unassigned' if location is null
        const statusName = item.status || 'Unassigned'

        // Initialize the array for this status if it doesn't exist
        if (!acc[statusName]) {
          acc[statusName] = []
        }

        // Add the current item to its status group
        acc[statusName].push(item)
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

    setGroupedByStatus(groupedArray)
  }, [storeItemsList, searchBarQuery])

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
    >
      {groupedByStatus.length > 0 ? (
        <Animated.View
          style={styles.groupContainer}
          entering={FadeInDown.springify()}
          exiting={FadeOutUp.springify()}
          layout={LinearTransition.springify()}
        >
          {groupedByStatus.map(([status, items]) => (
            <View key={status} style={styles.statusGroup}>
              <Text style={styles.statusHeader}>{capitalize(status)}</Text>
              {items.map((item, itemIndex) => (
                <Pressable
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => {}}
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
    </ScrollView>
  )
}

export default HistoryPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gray[50],
    padding: 12,
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
  statusGroup: {
    marginBottom: 20,
  },
  statusHeader: {
    fontFamily: poppins.SemiBold,
    fontSize: size.md,
    color: gray[600],
    paddingVertical: 8,
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
