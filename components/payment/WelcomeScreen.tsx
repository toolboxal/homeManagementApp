import { gray, primary } from '@/constants/colors'
import { bitter, poppins, size } from '@/constants/fonts'
import { Image, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.title}>Welcome to</Text>
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  )
}
export default WelcomeScreen
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: primary[700],
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 30,
  },
  image: {
    width: 200,
    height: 200,
  },
  title: {
    fontFamily: bitter.Regular,
    fontSize: 45,
    color: primary[200],
    marginTop: 60,
  },
})
