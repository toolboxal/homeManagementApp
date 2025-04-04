import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Platform } from 'react-native'
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesError,
} from 'react-native-purchases'
import { MMKVStorage } from '@/storage/mmkv'
import HardPaywall from '@/components/payment/HardPaywall'
import TrialModal from '@/components/payment/TrialModal'
import WelcomeScreen from '@/components/payment/WelcomeScreen'
import { toast } from 'sonner-native'
import CustomToast from '@/components/UI/CustomToast'

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
}

interface RevenueCatProps {
  isPro: boolean
  isTrialActive: boolean
  hasAccess: boolean
  subscribeNow: () => void
  restorePurchase: () => Promise<void>
  trialTimeLeft: number
}

const RevenueCatContext = createContext<RevenueCatProps>({
  isPro: false,
  isTrialActive: false,
  hasAccess: false,
  subscribeNow: () => {},
  restorePurchase: async () => {},
  trialTimeLeft: 0,
})

export const RevenueCatProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isPro, setIsPro] = useState(false)
  const [isTrialActive, setIsTrialActive] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [trialTimeLeft, setTrialTimeLeft] = useState(0)

  const TOTAL_TRIAL_DURATION = 1 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        const apiKey = Platform.OS === 'ios' ? APIKeys.apple : APIKeys.google
        Purchases.configure({ apiKey })
        Purchases.setLogLevel(LOG_LEVEL.DEBUG)

        const trialStart = MMKVStorage.getString('trialStartDate')
        const modalShown = MMKVStorage.getBoolean('trialModalShown')

        if (!trialStart && !modalShown) {
          setShowTrialModal(true)
        } else if (trialStart && !modalShown) {
          updateTrialStatus(new Date(trialStart))
          startTimer() // Start timer for existing trial
        }

        const listener = (customerInfo: CustomerInfo) => {
          updateCustomerInfo(customerInfo)
        }
        Purchases.addCustomerInfoUpdateListener(listener)

        const customerInfo = await Purchases.getCustomerInfo()
        updateCustomerInfo(customerInfo)

        setIsReady(true)
      } catch (error) {
        console.error('RevenueCat initialization failed:', error)
        setIsReady(true)
      }
    }

    initialize()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (isTrialActive && !intervalRef.current) {
      startTimer()
    } else if (!isTrialActive && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isTrialActive])

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const trialStart = MMKVStorage.getString('trialStartDate')
      if (trialStart) {
        updateTrialStatus(new Date(trialStart))
      }
    }, 1000)
  }

  const updateCustomerInfo = (customerInfo: CustomerInfo) => {
    const proActive = customerInfo.entitlements.active['pro_plan'] !== undefined
    setIsPro(proActive)
    if (proActive) {
      setIsTrialActive(false)
      MMKVStorage.set('trialModalShown', true)
    }
  }

  const restorePurchase = async () => {
    try {
      console.log('Restoring purchases...')
      const customerInfo = await Purchases.restorePurchases()
      updateCustomerInfo(customerInfo)
      toast.custom(<CustomToast message="Purchases restored successfully" />)
    } catch (error) {
      console.error('Restore purchases failed:', error)
      toast.custom(<CustomToast message="Failed to restore purchases" />)
    }
  }

  const updateTrialStatus = (startDate: Date) => {
    const now = new Date()
    const elapsedTime = now.getTime() - startDate.getTime()
    const remainingTime = Math.max(0, TOTAL_TRIAL_DURATION - elapsedTime)
    setIsTrialActive(remainingTime > 0)
    setTrialTimeLeft(remainingTime)
  }

  const startTrial = () => {
    const startDate = new Date()
    MMKVStorage.set('trialStartDate', startDate.toISOString())
    MMKVStorage.set('trialModalShown', true)
    setShowTrialModal(false)
    setIsTrialActive(true)
    updateTrialStatus(startDate)
  }

  const subscribeNow = async () => {
    console.log('subscribeNow pressed')
    try {
      const offerings = await Purchases.getOfferings()
      if (offerings.current) {
        await Purchases.purchasePackage(offerings.current.availablePackages[0])
        MMKVStorage.set('trialModalShown', true)
        setShowTrialModal(false)
        toast.custom(<CustomToast message="You have pro access now" />)
      }
    } catch (error) {
      const purchaseError = error as PurchasesError
      if (purchaseError.underlyingErrorMessage === 'User cancelled') {
        console.log('User cancelled the purchase')
      } else {
        toast.custom(<CustomToast message="Purchase cancelled" />)
      }
    }
  }

  if (!isReady) return null

  const hasAccess = isPro || isTrialActive
  const trialStart = MMKVStorage.getString('trialStartDate')

  return (
    <>
      <RevenueCatContext.Provider
        value={{
          isPro,
          isTrialActive,
          hasAccess,
          subscribeNow,
          restorePurchase,
          trialTimeLeft,
        }}
      >
        {hasAccess ? (
          children
        ) : trialStart ? (
          <HardPaywall subscribeNow={subscribeNow} />
        ) : (
          <WelcomeScreen />
        )}
      </RevenueCatContext.Provider>
      <TrialModal
        handleStartTrial={startTrial}
        handleSubscribeNow={subscribeNow}
        showTrialModal={showTrialModal}
        title="Pro Plan"
        description={{
          period: 'full trial access for 7 days',
          desc1: 'or subscribe now',
          btn1: 'Continue for free',
          btn2: 'Subscribe now',
        }}
      />
    </>
  )
}

export const useRevenueCat = () => useContext(RevenueCatContext)
