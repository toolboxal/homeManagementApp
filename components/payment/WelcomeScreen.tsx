import { gray, primary } from '@/constants/colors'
import { bitter, poppins, size } from '@/constants/fonts'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.page}>
      <LinearGradient
        // Background Linear Gradient
        colors={[primary[300], primary[200]]}
        style={styles.background}
      />
      <Text style={styles.title}>Welcome to</Text>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>perfect</Text>
        <Text style={styles.logoText}>spaces</Text>
      </View>
    </SafeAreaView>
  )
}
export default WelcomeScreen

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: primary[300],
    paddingHorizontal: 60,
    paddingVertical: 20,
    // alignItems: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  logoBox: {
    marginTop: 30,
  },
  logoText: {
    fontFamily: poppins.Bold,
    fontSize: 60,
    color: 'white',
    lineHeight: 68,
    textAlign: 'center',
  },
  title: {
    fontFamily: poppins.Medium,
    fontSize: size.xxxl,
    color: primary[950],
    marginTop: 80,
    textAlign: 'center',
  },
})
