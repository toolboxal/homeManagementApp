import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { gray, green, primary } from '@/constants/colors'
import { MoveLeft } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases'
import { poppins, size } from '@/constants/fonts'
import { useRevenueCat } from '@/providers/RCProvider'

const upgradePage = () => {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const { restorePurchase, handlePurchase } = useRevenueCat()

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        setLoading(true)
        const offeringsData = await Purchases.getOfferings()
        setOfferings(offeringsData)
      } catch (e) {
        console.error('Error fetching offerings:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchOfferings()
  }, [])

  const monthlyPrice =
    offerings?.all['3 months']?.threeMonth?.product.priceString
  const monthlyPricePerMonth =
    offerings?.all['3 months']?.threeMonth?.product.pricePerMonth.toFixed(2)
  const yearlyPrice = offerings?.all['yearly_plan']?.annual?.product.priceString
  const yearlyPricePerMonth =
    offerings?.all['yearly_plan']?.annual?.product.pricePerMonth.toFixed(2)
  const lifetimePrice =
    offerings?.all['lifetime']?.lifetime?.product.priceString
  const currency = offerings?.all['lifetime']?.lifetime?.product.currencyCode

  // Get the actual package objects, not just identifiers
  const monthlyPackage = offerings?.all['3 months']?.threeMonth
  const yearlyPackage = offerings?.all['yearly_plan']?.annual
  const lifetimePackage = offerings?.all['lifetime']?.lifetime

  if (loading) {
    return (
      <View style={styles.page}>
        <Text style={styles.textDesc}>Loading subscription options...</Text>
      </View>
    )
  }

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <MoveLeft color={primary[700]} size={25} />
        </Pressable>
      </View>
      <View style={{ padding: 20 }}>
        <View style={{ marginBottom: 30 }}>
          <Text style={styles.logoText}>perfect</Text>
          <Text style={styles.logoText}>spaces</Text>
        </View>
        <Text style={styles.title}>Thinking of upgrading?</Text>
        <View>
          <Text style={styles.textDesc}>own the spaces in your home</Text>
          <Text style={styles.textDesc}>
            for less than a cup of coffee per month
          </Text>
          <Text style={styles.textDesc}>or keep this app forever</Text>
          <Text style={styles.textDesc}>cancel anytime</Text>
        </View>
      </View>
      <View style={styles.btnContainer}>
        <Pressable
          style={styles.btn}
          onPress={() => {
            monthlyPackage && handlePurchase(monthlyPackage)
          }}
        >
          <View style={{ flexDirection: 'column', gap: 5 }}>
            <Text style={styles.btnHeader}>3 months</Text>
            <Text
              style={styles.btnText}
            >{`Free trial, then ${currency} ${monthlyPricePerMonth}/month`}</Text>
          </View>
          <View style={{ flexDirection: 'column', gap: 5 }}>
            <Text style={[styles.btnHeader, { textAlign: 'right' }]}>
              {currency} {monthlyPrice}
            </Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => {
            yearlyPackage && handlePurchase(yearlyPackage)
          }}
        >
          <View style={{ flexDirection: 'column', gap: 5 }}>
            <Text style={styles.btnHeader}>Yearly</Text>
            <Text
              style={styles.btnText}
            >{`Free trial, then ${currency} ${yearlyPricePerMonth}/month`}</Text>
          </View>
          <View style={{ flexDirection: 'column', gap: 3 }}>
            <Text style={[styles.btnHeader, { textAlign: 'right' }]}>
              {currency} {yearlyPrice}
            </Text>
            <View
              style={{
                padding: 4,
                backgroundColor: green[400],
                borderRadius: 5,
                alignSelf: 'flex-end',
              }}
            >
              <Text style={[styles.btnText, { color: 'white' }]}>
                best value
              </Text>
            </View>
          </View>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => {
            lifetimePackage && handlePurchase(lifetimePackage)
          }}
        >
          <View style={{ flexDirection: 'column', gap: 5 }}>
            <Text style={styles.btnHeader}>Lifetime</Text>
            <Text style={styles.btnText}>One time payment</Text>
          </View>
          <View style={{ flexDirection: 'column', gap: 5 }}>
            <Text style={[styles.btnHeader, { textAlign: 'right' }]}>
              {currency} {lifetimePrice}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}
export default upgradePage
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: primary[300],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    backgroundColor: primary[100],
  },
  btnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    backgroundColor: primary[200],
    height: '50%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: 'column',
    gap: 12,
  },
  btn: {
    padding: 12,
    borderRadius: 10,
    borderColor: gray[300],
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  btnHeader: {
    color: primary[950],
    fontFamily: poppins.Medium,
    fontSize: size.md,
  },
  btnText: {
    color: primary[950],
    fontFamily: poppins.Regular,
    fontSize: size.xs,
  },
  textDesc: {
    fontFamily: poppins.Bold,
    fontSize: size.md,
    color: primary[500],
    marginTop: 10,
  },
  title: {
    fontSize: size.xxxl,
    fontFamily: poppins.Bold,
    marginBottom: 15,
    color: primary[500],
    lineHeight: 45,
  },
  logoText: {
    color: 'white',
    fontFamily: poppins.Bold,
    textAlign: 'right',
    fontSize: size.xxl,
  },
})
