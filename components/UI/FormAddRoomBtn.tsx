import { Pressable, StyleSheet } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { gray } from '@/constants/colors'

type Props = {
  setOpenAddNewRoomModal: React.Dispatch<React.SetStateAction<boolean>>
}

const FormAddBtn = ({ setOpenAddNewRoomModal }: Props) => {
  return (
    <Pressable
      style={styles.addBtn}
      onPress={() => {
        setOpenAddNewRoomModal(true)
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
