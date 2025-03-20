import { Pressable, StyleSheet } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { gray } from '@/constants/colors'
import * as Haptics from 'expo-haptics'

type Props = {
  setOpenAddNewLocModal: React.Dispatch<React.SetStateAction<boolean>>
  setLocType: React.Dispatch<
    React.SetStateAction<'room' | 'spot' | 'direction'>
  >
  type: 'room' | 'spot' | 'direction'
}

const FormAddBtn = ({ setOpenAddNewLocModal, setLocType, type }: Props) => {
  return (
    <Pressable
      style={styles.addBtn}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setOpenAddNewLocModal(true)
        setLocType(type)
      }}
    >
      <MaterialIcons name="add" size={15} color={gray[900]} />
    </Pressable>
  )
}
export default FormAddBtn
const styles = StyleSheet.create({
  addBtn: {
    padding: 2,
    borderColor: gray[900],
    borderWidth: 1,
    borderRadius: 100,
  },
})
