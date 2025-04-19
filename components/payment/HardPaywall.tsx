import { gray, green, primary } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import { Pressable, StyleSheet, Text, View, Linking } from 'react-native'
import { toast } from 'sonner-native'
import CustomToast from '../UI/CustomToast'
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases'
import { useEffect, useState } from 'react'
import { useRevenueCat } from '@/providers/RCProvider'

type props = {
  handlePurchase: (packageId: PurchasesPackage) => void
}

const HardPaywall = ({ handlePurchase }: props) => {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)
  const [loading, setLoading] = useState(true)

  const { restorePurchase } = useRevenueCat()

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        setLoading(true)
        const offeringsData = await Purchases.getOfferings()
        setOfferings(offeringsData)
      } catch (e) {
        console.error('Error fetching offerings:', e)
        toast.error('Failed to load subscription options')
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
      <View style={{ marginBottom: 40 }}>
        <Text style={styles.logoText}>perfect</Text>
        <Text style={styles.logoText}>spaces</Text>
      </View>
      <Text style={styles.title}>Organize Your Home Effortlessly</Text>
      <View>
        <Text style={styles.textDesc}>reduce food wastage</Text>
        <Text style={styles.textDesc}>organize your perfect pantry</Text>
        <Text style={styles.textDesc}>always know where things are kept</Text>
        <Text style={styles.textDesc}>cancel anytime</Text>
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
        <Pressable
          style={{
            // backgroundColor: 'green',
            marginHorizontal: 'auto',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
            marginTop: 5,
          }}
          onPress={restorePurchase}
        >
          <Text style={[styles.textDesc, { marginTop: 0 }]}>
            Restore purchase
          </Text>
        </Pressable>
        <View style={styles.footerContainer}>
          <Pressable
            onPress={() =>
              Linking.openURL(
                'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
              )
            }
          >
            <Text style={styles.footerLink}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.footerSeparator}>|</Text>
          <Pressable
            onPress={() =>
              Linking.openURL(
                'https://www.privacypolicies.com/live/1f4f1d3e-83d3-4c96-88f2-c44f87dc3807'
              )
            }
          >
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default HardPaywall

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 25,
    paddingTop: 80,
    backgroundColor: primary[300],
  },
  logoText: {
    color: 'white',
    fontFamily: poppins.Bold,
    textAlign: 'right',
    fontSize: size.xxl,
  },
  trialText: {
    fontSize: size.md,
    fontFamily: poppins.Bold,
    marginBottom: 20,
    color: primary[400],
    textAlign: 'center',
  },
  title: {
    fontSize: size.xxxl,
    fontFamily: poppins.Bold,
    marginBottom: 15,
    color: primary[500],
    lineHeight: 45,
  },
  textDesc: {
    fontFamily: poppins.Bold,
    fontSize: size.md,
    color: primary[500],
    marginTop: 20,
  },
  discountContainer: {
    backgroundColor: primary[500],
    padding: 7,
    borderRadius: 8,
  },
  discountText: {
    fontFamily: poppins.Bold,
    fontSize: size.md,
    color: primary[200],
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    color: primary[600],
    fontFamily: poppins.Medium,
    fontSize: size.sm,
    textDecorationLine: 'none',
  },
  footerSeparator: {
    color: '#8E8E93',
    fontSize: 14,
    marginHorizontal: 10,
  },
})
