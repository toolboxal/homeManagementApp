import { useState } from 'react'
import { StyleSheet, Text, ScrollView, FlatList, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import db from '@/db/db'
import { locations } from '@/db/schema'
import { blue } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import { capitalize } from '@/utils/capitalize'

const InventoryPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const { data: roomList } = useQuery({
    queryKey: ['location', 'rooms'],
    queryFn: async () => {
      return await db.select().from(locations)
    },
  })
  console.log(roomList)
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>
      <FlatList
        horizontal
        data={roomList || []}
        renderItem={({ item }) => (
          <View key={item.id} style={styles.roomChip}>
            <Text style={styles.roomChipTxt}>{capitalize(item.room)}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        style={styles.roomListContainer}
        showsHorizontalScrollIndicator={false}
        decelerationRate={'fast'}
      />
    </ScrollView>
  )
}
export default InventoryPage
const styles = StyleSheet.create({
  roomListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roomChip: {
    backgroundColor: blue[300],
    borderRadius: 8,
    padding: 10,
    margin: 5,
    minWidth: 80,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomChipTxt: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    color: blue[900],
  },
})
