import { StyleSheet, Pressable, View, Modal } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { gray, blue } from '@/constants/colors'
import { add } from 'date-fns'
import Ionicons from '@expo/vector-icons/Ionicons'

type Props = {
  openDateModal: boolean
  setOpenDateModal: React.Dispatch<React.SetStateAction<boolean>>
  date: Date
  setDate: React.Dispatch<React.SetStateAction<Date>>
  today: Date
  dateOption: number
  dateBought: Date
  dateExpiry: Date
}

const FormDateModal = ({
  openDateModal,
  setOpenDateModal,
  date,
  setDate,
  today,
  dateOption,
  dateBought,
  dateExpiry,
}: Props) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={openDateModal}
      onRequestClose={() => setOpenDateModal(false)}
    >
      <Pressable style={styles.overlay} onPress={() => setOpenDateModal(false)}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={styles.datePickerBox}
        >
          <Pressable
            onPress={() => setOpenDateModal(false)}
            style={styles.closeBtn}
          >
            <Ionicons name="close-sharp" size={26} color={blue[800]} />
          </Pressable>
          <DateTimePicker
            mode="date"
            display="inline"
            accentColor={blue[800]}
            minimumDate={dateOption === 1 ? today : dateBought}
            maximumDate={
              dateOption === 1 ? dateExpiry : add(new Date(), { years: 10 })
            }
            value={date}
            onChange={(event, date) => {
              setDate(date || new Date())
            }}
            style={styles.datePicker}
          />
        </Pressable>
      </Pressable>
    </Modal>
  )
}
export default FormDateModal
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  datePickerBox: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    paddingTop: 20,
    position: 'relative',
  },
  datePicker: {
    transform: [{ scale: 0.88 }],
    padding: 0,
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
})
