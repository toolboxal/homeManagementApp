import { FlatList, Pressable, StyleSheet, Text } from 'react-native'
import { blue, gray } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import { capitalize } from '@/utils/capitalize'

type Props = {
  roomList: { id: number; room: string }[] | undefined
  selectedRoomId: number
  setSelectedRoomId: React.Dispatch<React.SetStateAction<number>>
}

const RoomListScroll = ({
  roomList,
  selectedRoomId,
  setSelectedRoomId,
}: Props) => {
  return (
    <FlatList
      horizontal
      data={roomList || []}
      renderItem={({ item }) => (
        <Pressable
          key={item.id}
          style={[
            styles.roomChip,
            {
              backgroundColor: selectedRoomId === item.id ? blue[300] : 'white',
            },
          ]}
          onPress={() => setSelectedRoomId(item.id)}
        >
          <Text style={styles.roomChipTxt}>{capitalize(item.room)}</Text>
        </Pressable>
      )}
      //   keyExtractor={(item) => item.id.toString()}
      style={styles.roomListContainer}
      showsHorizontalScrollIndicator={false}
      decelerationRate={'fast'}
    />
  )
}
export default RoomListScroll
const styles = StyleSheet.create({
  roomListContainer: {
    padding: 5,
  },
  roomChip: {
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
