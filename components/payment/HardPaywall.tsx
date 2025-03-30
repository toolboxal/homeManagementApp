import { gray, primary } from '@/constants/colors'
import { bitter, poppins, size } from '@/constants/fonts'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { toast } from 'sonner-native'
import CustomToast from '../UI/CustomToast'

type props = {
  subscribeNow: () => void
}

const HardPaywall = ({ subscribeNow }: props) => {
  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.title}>{`Start Your \nPro Plan \nNow`}</Text>
      <Text style={styles.slogan}>
        {'From Overwhelmed to Organized \n– At Your Fingertips!'}
      </Text>
      <View>
        <Text style={styles.textDesc}>
          Stay on top of replacements—never run out again
        </Text>
        <Text style={styles.textDesc}>
          Track food expiration dates effortlessly
        </Text>
        <Text style={styles.textDesc}>
          Always know where everything belongs
        </Text>
        <Text style={styles.textDesc}>
          Make smarter, more organized choices
        </Text>
      </View>
      <View style={styles.ctaContainer}>
        <Text style={styles.ctaText}>{`annual plan: USD 11`}</Text>
        <View style={styles.discountContainer}>
          <Text style={styles.discountText}>40% off</Text>
        </View>
      </View>
      <View style={styles.btnContainer}>
        <Pressable
          style={styles.btn}
          onPress={() => {
            subscribeNow()
          }}
        >
          <Text style={styles.btnText}>Subscribe now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default HardPaywall

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 25,
    paddingTop: 70,
    backgroundColor: primary[300],
  },
  title: {
    fontSize: 50,
    fontFamily: bitter.Bold,
    marginBottom: 40,
    color: primary[700],
  },
  slogan: {
    fontSize: size.lg,
    fontFamily: poppins.Bold,
    marginBottom: 25,
    color: primary[700],
  },

  textDesc: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: primary[700],
    marginBottom: 20,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ctaText: {
    fontFamily: poppins.Bold,
    fontSize: size.lg,
    color: primary[700],
    marginBottom: 20,
    textAlign: 'center',
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
    padding: 50,
    backgroundColor: primary[200],
    height: 180,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  btn: {
    padding: 10,
    borderRadius: 10,
  },
  btnText: {
    color: primary[950],
    fontFamily: poppins.Bold,
    fontSize: size.md,
    textAlign: 'center',
  },
})
