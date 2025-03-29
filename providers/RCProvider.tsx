import React, { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL, CustomerInfo } from 'react-native-purchases'
import { MMKVStorage } from '@/storage/mmkv'
import HardPaywall from '@/components/payment/HardPaywall'
import TrialModal from '@/components/payment/TrialModal'

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
}

interface RevenueCatProps {
  isPro: boolean
  isTrialActive: boolean
  hasAccess: boolean
}

const RevenueCatContext = createContext<RevenueCatProps>({
  isPro: false,
  isTrialActive: false,
  hasAccess: false,
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

  useEffect(() => {
    const initialize = async () => {
      try {
        // Configure RevenueCat
        const apiKey = Platform.OS === 'ios' ? APIKeys.apple : APIKeys.google
        Purchases.configure({ apiKey })
        Purchases.setLogLevel(LOG_LEVEL.DEBUG)

        // Check trial status
        const trialStart = MMKVStorage.getString('trialStartDate')
        const modalShown = MMKVStorage.getBoolean('trialModalShown')

        if (!trialStart && !modalShown) {
          // First launch - show modal
          setShowTrialModal(true)
        } else if (trialStart && !modalShown) {
          // Trial in progress - check if still active
          updateTrialStatus(new Date(trialStart))
        }

        // Add RevenueCat listener
        const listener = (customerInfo: CustomerInfo) => {
          updateCustomerInfo(customerInfo)
        }
        Purchases.addCustomerInfoUpdateListener(listener)

        // Fetch initial state
        const customerInfo = await Purchases.getCustomerInfo()
        updateCustomerInfo(customerInfo)

        setIsReady(true)
      } catch (error) {
        console.error('RevenueCat initialization failed:', error)
        setIsReady(true)
      }
    }

    initialize()
  }, [])

  const updateCustomerInfo = (customerInfo: CustomerInfo) => {
    const proActive = customerInfo.entitlements.active['pro_plan'] !== undefined
    setIsPro(proActive)
    if (proActive) {
      setIsTrialActive(false) // End trial if pro is purchased
      MMKVStorage.set('trialModalShown', true)
    }
  }

  const updateTrialStatus = (startDate: Date) => {
    const now = new Date()
    const diffTime = now.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60))
    setIsTrialActive(diffDays < 5)
  }

  const startTrial = () => {
    const startDate = new Date()
    MMKVStorage.set('trialStartDate', startDate.toISOString())
    MMKVStorage.set('trialModalShown', true)
    setShowTrialModal(false)
    setIsTrialActive(true)
  }

  const subscribeNow = async () => {
    try {
      const offerings = await Purchases.getOfferings()
      if (offerings.current) {
        await Purchases.purchasePackage(offerings.current.availablePackages[0])
      }
      MMKVStorage.set('trialModalShown', true)
      setShowTrialModal(false)
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  if (!isReady) return null // Or loading spinner

  const hasAccess = isPro || isTrialActive

  return (
    <>
      <RevenueCatContext.Provider value={{ isPro, isTrialActive, hasAccess }}>
        {hasAccess ? children : <HardPaywall />}
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
