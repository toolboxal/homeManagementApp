import { blue, gray } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import { StyleSheet, Text, View } from 'react-native'

const CustomToast = ({ message }: { message: string }) => {
  return (
    <View style={styles.toastBody}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  )
}
export default CustomToast
const styles = StyleSheet.create({
  toastBody: {
    backgroundColor: gray[950],
    padding: 10,
    paddingLeft: 25,
    borderRadius: 30,
    width: '70%',
    marginHorizontal: 'auto',
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  toastText: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    color: blue[200],
  },
})
