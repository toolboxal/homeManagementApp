import { gray, primary } from '@/constants/colors'
import { bitter, poppins, size } from '@/constants/fonts'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
const HardPaywall = () => {
  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.title}>{`Start Your \nPro Plan \nNow`}</Text>
      <Text style={styles.slogan}>
        {'From Overwhelmed to Organized – \nAt Your Fingertips!'}
      </Text>
      <View>
        <Text style={styles.textDesc}>know when to replace your items</Text>
        <Text style={styles.textDesc}>
          always know when your food is expiring
        </Text>
        <Text style={styles.textDesc}>know where you keep your stuffs</Text>
        <Text style={styles.textDesc}>make better choices</Text>
      </View>
      <Text
        style={styles.ctaText}
      >{`less than a cup of coffee per month 🤯`}</Text>
      <View style={styles.btnContainer}>
        <Pressable style={styles.btn}>
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
    backgroundColor: primary[700],
  },
  title: {
    fontSize: 50,
    fontFamily: bitter.Bold,
    marginBottom: 40,
    color: primary[200],
  },
  slogan: {
    fontSize: size.lg,
    fontFamily: bitter.Bold,
    marginBottom: 25,
    color: primary[200],
  },

  textDesc: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: primary[200],
    marginBottom: 20,
  },
  ctaText: {
    fontFamily: poppins.Bold,
    fontSize: size.lg,
    color: primary[200],
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  btnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 50,
    backgroundColor: primary[950],
    height: 180,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  btn: {
    padding: 10,
    borderRadius: 10,
  },
  btnText: {
    color: 'white',
    fontFamily: poppins.Bold,
    fontSize: size.md,
    textAlign: 'center',
  },
})
