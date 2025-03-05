import { Pressable, StyleSheet, Text } from 'react-native'
import { gray } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import Entypo from '@expo/vector-icons/Entypo'

type StorePlaceObj = { room: string; spot: string; direction: string }

// Define specific types for each object kind
type RoomObj = { id: number; room: string }
type SpotObj = { id: number; spot: string }
type DirectionObj = { id: number; direction: string }

type Props = {
  locationObj: RoomObj | SpotObj | DirectionObj
  storeSelection: string
  setStoreSelection: React.Dispatch<React.SetStateAction<StorePlaceObj>>
  category: 'room' | 'spot' | 'direction'
}

const Chips = ({
  locationObj,
  storeSelection,
  setStoreSelection,
  category,
}: Props) => {
  let value = ''

  if (category === 'room' && 'room' in locationObj) {
    value = locationObj.room
  } else if (category === 'spot' && 'spot' in locationObj) {
    value = locationObj.spot
  } else if (category === 'direction' && 'direction' in locationObj) {
    value = locationObj.direction
  }

  const formatted = value.split('_').join(' ').toUpperCase()
  const isSelected = storeSelection === value
  return (
    <Pressable
      style={isSelected ? styles.selectedChip : styles.chip}
      onPress={() =>
        setStoreSelection((prev) => ({ ...prev, [category]: value }))
      }
    >
      <Entypo
        name="dot-single"
        size={12}
        color={isSelected ? gray[50] : gray[900]}
      />
      <Text style={isSelected ? styles.selectedChipText : styles.chipText}>
        {formatted}
      </Text>
    </Pressable>
  )
}
export default Chips
const styles = StyleSheet.create({
  chip: {
    padding: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: gray[500],
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChip: {
    padding: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: gray[400],
    backgroundColor: gray[900],
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: gray[500],
  },
  selectedChipText: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: gray[50],
  },
})
