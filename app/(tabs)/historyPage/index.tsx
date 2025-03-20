import { useEffect, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Stack } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { storeItems, TStoreItemSelect } from '@/db/schema'
import { primary, brown, gray, green, red } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import { fetchNonActiveItems } from '@/utils/fetchNonActiveItems'
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated'
import { capitalize } from '@/utils/capitalize'
import { Drumstick, Recycle, Trash2 } from 'lucide-react-native'
import { format } from 'date-fns'
import * as ContextMenu from 'zeego/context-menu'
import { eq, not } from 'drizzle-orm'
import db from '@/db/db'

type GroupedItems = Array<[string, TStoreItemSelect[]]>

const amountAlertColors = {
  empty: brown[300],
  low: brown[100],
  half: green[100],
  full: green[300],
}

const statusHeaderEmoji: Record<string, React.ReactNode> = {
  consumed: <Drumstick size={20} color={primary[500]} strokeWidth={2.5} />,
  recycled: <Recycle size={20} color={green[500]} strokeWidth={2.5} />,
  disposed: <Trash2 size={20} color={red[400]} strokeWidth={2.5} />,
  deleted: null,
}

const HistoryPage = () => {
  const [groupedByStatus, setGroupedByStatus] = useState<GroupedItems>([])
  const [searchBarQuery, setSearchBarQuery] = useState<string>('')
  const queryClient = useQueryClient()

  const {
    data: storeItemsList,
    isLoading,
    refetch,
  } = useQuery({
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
    // Convert the grouped data object to an array of [statusName, items] pairs
    const groupedArray = Object.entries(groupedData)

    // Sort by status name (but keep 'Unassigned' at the end)
    groupedArray.sort((a, b) => {
      if (a[0] === 'Unassigned') return 1
      if (b[0] === 'Unassigned') return -1
      return a[0].localeCompare(b[0])
    })

    setGroupedByStatus(groupedArray)
  }, [storeItemsList, searchBarQuery])

  const handleUndo = async (id: number) => {
    await db
      .update(storeItems)
      .set({
        status: 'active',
        dateStatusChange: format(new Date(), 'yyyy-MM-dd'),
      })
      .where(eq(storeItems.id, id))
    queryClient.invalidateQueries({ queryKey: ['store_items'] })
    queryClient.invalidateQueries({ queryKey: ['history'] })
  }

  const handleClearHistory = async () => {
    await db.delete(storeItems).where(not(eq(storeItems.status, 'active')))
    queryClient.invalidateQueries({ queryKey: ['history'] })
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
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
      {isLoading && (
        <View style={{ flex: 1 }}>
          <ActivityIndicator size={'large'} color={primary[500]} />
        </View>
      )}

      {groupedByStatus.length > 0 ? (
        <Animated.View
          style={styles.groupContainer}
          entering={FadeInDown.springify()}
          exiting={FadeOutUp.springify()}
          layout={LinearTransition.springify()}
        >
          <Pressable
            style={styles.clearHistoryBox}
            onPress={() =>
              Alert.alert(
                'Clear History',
                'This will permanently delete all items in this list.',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Confirm',
                    onPress: async () => {
                      await handleClearHistory()
                    },
                  },
                ]
              )
            }
          >
            <Text style={styles.clearHistoryTxt}>Clear History</Text>
          </Pressable>
          {groupedByStatus.map(([status, items]) => (
            <View key={status} style={styles.statusGroup}>
              <View style={styles.statusHeaderBox}>
                {statusHeaderEmoji[status]}
                <Text style={styles.statusHeader}>{capitalize(status)}</Text>
              </View>
              {items.map((item, itemIndex) => (
                <ContextMenu.Root key={item.id}>
                  <ContextMenu.Trigger>
                    <View key={item.id} style={styles.itemRow}>
                      <View
                        style={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 2,
                        }}
                      >
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                      <Text style={styles.dateStyle}>
                        {'Bought on: ' + format(item.dateBought, 'dd MMM yy')}
                      </Text>
                    </View>
                  </ContextMenu.Trigger>
                  <ContextMenu.Content>
                    <ContextMenu.Item
                      key="undo"
                      onSelect={() => handleUndo(item.id)}
                    >
                      <ContextMenu.ItemIcon
                        ios={{ name: 'arrow.uturn.left.circle' }}
                      />
                      <ContextMenu.ItemTitle>Undo</ContextMenu.ItemTitle>
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
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
          <Text style={styles.emptyStateText}>
            Inventory Items marked as consumed, recycled or disposed will appear
            here.
          </Text>
          <View style={styles.emptyStateIcons}>
            <View style={styles.iconWithLabel}>
              <Drumstick size={20} color={primary[500]} strokeWidth={2.5} />
              <Text style={styles.iconLabel}>Consumed</Text>
            </View>
            <View style={styles.iconWithLabel}>
              <Recycle size={20} color={green[500]} strokeWidth={2.5} />
              <Text style={styles.iconLabel}>Recycled</Text>
            </View>
            <View style={styles.iconWithLabel}>
              <Trash2 size={20} color={red[400]} strokeWidth={2.5} />
              <Text style={styles.iconLabel}>Disposed</Text>
            </View>
          </View>
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
    color: primary[900],
    marginBottom: 16,
  },
  groupContainer: {
    marginTop: 10,
  },
  statusGroup: {
    marginBottom: 20,
  },
  statusHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingRight: 5,
  },
  statusHeader: {
    fontFamily: poppins.SemiBold,
    fontSize: size.xl,
    color: gray[600],
    paddingVertical: 8,
    marginBottom: 1,
  },
  itemRow: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 4,
    // borderBottomWidth: 1,
    // borderBottomColor: gray[300],
  },
  itemName: {
    fontFamily: poppins.Medium,
    fontSize: size.xs,
    color: gray[900],
  },
  dateStyle: {
    fontFamily: poppins.Light,
    fontSize: 11,
  },
  emptyState: {
    padding: 24,
    marginTop: 120,
  },
  emptyStateText: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: gray[400],
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateIcons: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWithLabel: {
    alignItems: 'center',
    gap: 4,
  },
  iconLabel: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: gray[400],
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
  clearHistoryBox: {
    backgroundColor: red[50],
    padding: 5,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearHistoryTxt: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    color: red[500],
  },
})
