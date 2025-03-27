import { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import { CustomerInfo } from 'react-native-purchases'
import { custom } from 'zod'

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
}

interface RevenueCatProps {
  isPro: boolean
}

const RevenueCatContext = createContext<Partial<RevenueCatProps>>({})

export const RevenueCatProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isPro, setIsPro] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = () => {
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: APIKeys.apple })
    } else {
      Purchases.configure({ apiKey: APIKeys.google })
    }
    setIsReady(true)
    Purchases.setLogLevel(LOG_LEVEL.DEBUG)

    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log('customer info', customerInfo)
      updateCustomerInfo(customerInfo)
    })
    const updateCustomerInfo = async (customerInfo: CustomerInfo) => {
      if (customerInfo.entitlements.active['pro_plan'] !== undefined) {
        setIsPro(true)
      } else setIsPro(false)
    }
  }
  if (!isReady) return <></>
  return (
    <RevenueCatContext.Provider value={{ isPro }}>
      {children}
    </RevenueCatContext.Provider>
  )
}

export const useRevenueCat = () => useContext(RevenueCatContext)
