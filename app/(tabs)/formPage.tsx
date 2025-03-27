import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Form from '@/components/form/Form'
import { gray, primary } from '@/constants/colors'
import { useRevenueCat } from '@/providers/RCProvider'
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'

const goPro = async () => {
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall()
  console.log(paywallResult)
}

const formPage = () => {
  const { isPro } = useRevenueCat()
  if (!isPro) {
    goPro()
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: primary[50] }}
    >
      <Form />
    </SafeAreaView>
  )
}
export default formPage
const styles = StyleSheet.create({})
