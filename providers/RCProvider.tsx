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
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
}

interface RevenueCatProps {
  isPro: boolean
  restorePurchase: () => Promise<void>
  presentSubscriptionUpgrade: () => Promise<void>
  currentSubscriptionType: string | null
  openManageSubscriptions: () => Promise<void>
  handlePurchase: (packageId: PurchasesPackage) => void
}

const RevenueCatContext = createContext<RevenueCatProps>({
  isPro: false,
  restorePurchase: async () => {},
  presentSubscriptionUpgrade: async () => {},
  currentSubscriptionType: null,
  openManageSubscriptions: async () => {},
  handlePurchase: async () => {},
})

export const RevenueCatProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isPro, setIsPro] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentSubscriptionType, setCurrentSubscriptionType] = useState<
    string | null
  >(null)

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
    console.log('subscription type:', customerInfo.activeSubscriptions)
    return proActive
  }

  const restorePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      console.log('Restoring purchases...')
      const customerInfo = await Purchases.restorePurchases()
      const proActive = updateCustomerInfo(customerInfo)
      if (proActive) {
        toast.custom(<CustomToast message="Purchases restored successfully" />)
      } else {
        toast.custom(<CustomToast message="Failed to restore purchases" />)
      }
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

  const presentSubscriptionUpgrade = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    try {
      // Get all offerings first
      const offeringsData = await Purchases.getOfferings()

      if (!offeringsData || !offeringsData.all) {
        toast.custom(
          <CustomToast message="Failed to load subscription options" />
        )
        return
      }

      // Determine which offering to display based on current subscription
      let offeringToUse = offeringsData.current

      // For users with 3-month subscription, show them yearly and lifetime options
      if (
        currentSubscriptionType === '3 months' &&
        offeringsData.all['upgrade_options']
      ) {
        offeringToUse = offeringsData.all['upgrade_options']
      }
      // For users with yearly subscription, show them only lifetime option
      else if (
        currentSubscriptionType === 'yearly_plan' &&
        offeringsData.all['lifetime_only']
      ) {
        offeringToUse = offeringsData.all['lifetime_only']
      }
      // For lifetime users, there's no upgrade path
      else if (currentSubscriptionType === 'lifetime') {
        toast.custom(
          <CustomToast message="You already have a lifetime subscription!" />
        )
        return
      }

      if (!offeringToUse) {
        // Fallback to current offering if the specific one isn't found
        offeringToUse = offeringsData.current

        if (!offeringToUse) {
          toast.custom(
            <CustomToast message="No subscription options available" />
          )
          return
        }
      }

      const result = await RevenueCatUI.presentPaywall({
        offering: offeringToUse,
      })

      if (result === PAYWALL_RESULT.PURCHASED) {
        // Refresh customer info after purchase
        const customerInfo = await Purchases.getCustomerInfo()
        updateCustomerInfo(customerInfo)
        toast.custom(
          <CustomToast message="Subscription upgraded successfully!" />
        )
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      console.error('Error presenting paywall:', error)
      toast.custom(
        <CustomToast message="Failed to load subscription options" />
      )
    }
  }

  const openManageSubscriptions = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      await Purchases.showManageSubscriptions()
    } catch (error) {
      console.error('Failed to open subscription management', error)
      toast.custom(
        <CustomToast message="Failed to open subscription settings" />
      )
    }
  }

  if (!isReady) return null

  return (
    <>
      <RevenueCatContext.Provider
        value={{
          isPro,
          restorePurchase,
          presentSubscriptionUpgrade,
          currentSubscriptionType,
          openManageSubscriptions,
          handlePurchase,
        }}
      >
        {isPro ? children : <HardPaywall handlePurchase={handlePurchase} />}
      </RevenueCatContext.Provider>
    </>
  )
}

export const useRevenueCat = () => useContext(RevenueCatContext)
