import { StyleSheet, Text, View } from 'react-native'
import { primary } from '@/constants/colors'
import { X, Cloud } from 'lucide-react-native'
import { poppins, size } from '@/constants/fonts'
import { Pressable } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'

const settingsPage = () => {
  const router = useRouter()
  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <X color={primary[700]} size={23} />
        </Pressable>
      </View>
      <View style={styles.spine}>
        <Text style={styles.title}>settings</Text>
        <Pressable style={styles.optionContainer}>
          <Text style={styles.optionTxt}>Backup to Cloud</Text>
          <Cloud color={primary[700]} size={23} strokeWidth={1} />
        </Pressable>
      </View>
    </View>
  )
}
export default settingsPage
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: primary[50],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 15,
  },
  spine: {
    flex: 1,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: size.xxl,
    fontFamily: poppins.SemiBold,
    color: primary[700],
    marginBottom: 20,
  },
  optionContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTxt: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    color: primary[700],
  },
})
