import { StyleSheet, Text, View } from 'react-native'
import { primary } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import { Pressable } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { createBackup, restoreFromBackup } from '@/utils/backup'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner-native'
import CustomToast from '@/components/UI/CustomToast'
import {
  X,
  HardDriveUpload,
  HardDriveDownload,
  LandPlot,
  DollarSign,
  ChevronRight,
} from 'lucide-react-native'
import { useRevenueCat } from '@/providers/RCProvider'

const settingsPage = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isPro, subscribeNow } = useRevenueCat()

  const handleBackUp = async () => {
    await createBackup()
    router.dismiss()
  }

  const handleRestore = async () => {
    const result = await restoreFromBackup()
    if (result === 'success') {
      queryClient.invalidateQueries({ queryKey: ['store_items'] })
      queryClient.invalidateQueries({
        queryKey: ['shoppingList'],
      })
      queryClient.invalidateQueries({
        queryKey: ['history'],
      })
      toast.custom(<CustomToast message="Data restored successfully" />)
      router.dismiss()
    }
  }
  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <X color={primary[700]} size={23} />
        </Pressable>
      </View>
      <View style={styles.spine}>
        <Text style={styles.title}>settings</Text>
        <Pressable style={styles.optionContainer} onPress={handleBackUp}>
          <Text style={styles.optionTxt}>create backup</Text>
          <HardDriveUpload color={primary[700]} size={23} strokeWidth={2} />
        </Pressable>
        <Pressable style={styles.optionContainer} onPress={handleRestore}>
          <Text style={styles.optionTxt}>restore backup</Text>
          <HardDriveDownload color={primary[700]} size={23} strokeWidth={2} />
        </Pressable>
        <Pressable
          style={styles.optionContainer}
          onPress={() => {
            router.navigate('/(settings)/chipsPage')
          }}
        >
          <Text style={styles.optionTxt}>delete room, spot or direction</Text>
          <LandPlot color={primary[700]} size={23} strokeWidth={1.5} />
        </Pressable>
        <Pressable
          style={styles.optionContainer}
          onPress={() => {
            router.navigate('/(settings)/currencyPage')
          }}
        >
          <Text style={styles.optionTxt}>change currency</Text>
          <DollarSign color={primary[700]} size={20} strokeWidth={2.5} />
        </Pressable>
        <Pressable
          style={styles.optionContainer}
          onPress={() => {
            console.log('pressed')
            subscribeNow()
          }}
        >
          <Text style={styles.optionTxt}>pro plan</Text>

          {isPro ? (
            <Text style={styles.optionTxt}>active</Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={styles.optionTxt}>not active</Text>
              <ChevronRight color={primary[700]} size={20} strokeWidth={2.5} />
            </View>
          )}
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
    padding: 12,
    backgroundColor: primary[100],
  },
  spine: {
    flex: 1,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: size.xxl,
    fontFamily: poppins.SemiBold,
    color: primary[700],
    marginTop: 10,
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
    marginBottom: 5,
  },
  optionTxt: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    color: primary[700],
  },
})
