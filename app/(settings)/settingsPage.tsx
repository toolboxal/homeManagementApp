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
  RotateCw,
  Clock,
} from 'lucide-react-native'
import { useRevenueCat } from '@/providers/RCProvider'
import { useEffect, useState } from 'react'

const settingsPage = () => {
  const [timer, setTimer] = useState(0)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isPro, isTrialActive, subscribeNow, restorePurchase, trialTimeLeft } =
    useRevenueCat()

  const totalSeconds = Math.floor(trialTimeLeft / 1000) // Convert to seconds
  const diffDays = Math.floor(totalSeconds / (60 * 60 * 24))
  const remainingHours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const remainingMinutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const remainingSeconds = totalSeconds % 60

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
          disabled={isPro}
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
        <Pressable
          style={styles.optionContainer}
          onPress={() => {
            restorePurchase()
          }}
        >
          <Text style={styles.optionTxt}>restore purchase</Text>
          <RotateCw color={primary[700]} size={20} strokeWidth={2.5} />
        </Pressable>

        {isTrialActive && trialTimeLeft && (
          <View style={styles.trialContainer}>
            <View style={styles.trialHeader}>
              <Clock color={primary[700]} size={18} strokeWidth={2} />
              <Text style={styles.trialHeaderText}>Trial Time Remaining</Text>
            </View>
            <View style={styles.trialTimerBox}>
              <View style={styles.timeUnit}>
                <Text style={styles.timeValue}>{diffDays}</Text>
                <Text style={styles.timeLabel}>days</Text>
              </View>
              <View style={styles.timeUnit}>
                <Text style={styles.timeValue}>{remainingHours}</Text>
                <Text style={styles.timeLabel}>hours</Text>
              </View>
              <View style={styles.timeUnit}>
                <Text style={styles.timeValue}>{remainingMinutes}</Text>
                <Text style={styles.timeLabel}>min</Text>
              </View>
              <View style={styles.timeUnit}>
                <Text style={styles.timeValue}>{remainingSeconds}</Text>
                <Text style={styles.timeLabel}>sec</Text>
              </View>
            </View>
          </View>
        )}
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
  trialContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    marginBottom: 5,
  },
  trialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  trialHeaderText: {
    fontFamily: poppins.Medium,
    fontSize: size.sm,
    color: primary[700],
  },
  trialTimerBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
  },
  timeUnit: {
    alignItems: 'center',
  },
  timeValue: {
    fontFamily: poppins.SemiBold,
    fontSize: size.xl,
    color: primary[800],
  },
  timeLabel: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: primary[500],
  },
})
