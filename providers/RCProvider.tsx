import React, { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesPackage,
} from 'react-native-purchases'
import HardPaywall from '@/components/payment/HardPaywall'
import { toast } from 'sonner-native'
import CustomToast from '@/components/UI/CustomToast'
import * as Haptics from 'expo-haptics'

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
}

interface RevenueCatProps {
  isPro: boolean
  restorePurchase: () => Promise<void>
}

const RevenueCatContext = createContext<RevenueCatProps>({
  isPro: false,
  restorePurchase: async () => {},
})

export const RevenueCatProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isPro, setIsPro] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        const apiKey = Platform.OS === 'ios' ? APIKeys.apple : APIKeys.google
        Purchases.configure({ apiKey })
        Purchases.setLogLevel(LOG_LEVEL.DEBUG)

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
  }, [])

  const updateCustomerInfo = (customerInfo: CustomerInfo) => {
    const proActive = customerInfo.entitlements.active['pro_plan'] !== undefined
    setIsPro(proActive)
  }

  const restorePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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

  const showError = (error: any) => {
    console.error('Purchase error:', error)
    toast.custom(<CustomToast message={`Purchase failed`} />)
  }

  async function handlePurchase(packageId: PurchasesPackage) {
    toast.custom(<CustomToast message="Processing purchase..." />)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageId)

      if (typeof customerInfo.entitlements.active['pro_plan'] !== 'undefined') {
        // Provide stronger haptic feedback for successful purchase
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        // Update UI state
        updateCustomerInfo(customerInfo)

        // Show success toast
        toast.custom(
          <CustomToast message="Purchase successful! You now have pro access." />
        )

        // Force a small delay to ensure UI updates are visible
        setTimeout(() => {
          setIsPro(true)
        }, 500)
      } else {
        // Purchase completed but entitlement not found
        toast.custom(
          <CustomToast message="Purchase completed, but subscription not activated. Please contact support." />
        )
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        showError(e)
      } else {
        // User cancelled the purchase
        toast.custom(<CustomToast message="Purchase cancelled" />)
      }
    }
  }

  if (!isReady) return null

  return (
    <>
      <RevenueCatContext.Provider
        value={{
          isPro,
          restorePurchase,
        }}
      >
        {isPro ? children : <HardPaywall handlePurchase={handlePurchase} />}
      </RevenueCatContext.Provider>
    </>
  )
}

export const useRevenueCat = () => useContext(RevenueCatContext)
