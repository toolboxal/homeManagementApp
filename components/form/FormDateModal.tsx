import {
  StyleSheet,
  Pressable,
  useColorScheme,
  Modal,
  Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { gray, primary } from '@/constants/colors'
import { add, sub } from 'date-fns'
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
  const colorScheme = useColorScheme()
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
          style={[
            styles.datePickerBox,
            {
              backgroundColor:
                colorScheme === 'dark' ? primary[500] : primary[100],
            },
          ]}
        >
          <Pressable
            onPress={() => setOpenDateModal(false)}
            style={styles.closeBtn}
          >
            <Ionicons name="close-sharp" size={26} color={primary[800]} />
          </Pressable>
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            accentColor={primary[800]}
            textColor={gray[900]}
            minimumDate={
              dateOption === 1 ? sub(today, { days: 30 }) : dateBought
            }
            maximumDate={
              dateOption === 1 ? dateExpiry : add(new Date(), { years: 10 })
            }
            value={date}
            onChange={(event, date) => {
              setDate(date || new Date())
            }}
            style={[
              styles.datePicker,
              {
                backgroundColor:
                  colorScheme === 'dark' ? primary[500] : primary[100],
              },
            ]}
            themeVariant={colorScheme || 'light'}
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
    // backgroundColor: 'white',
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
