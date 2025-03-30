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
    backgroundColor: primary[200],
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: 300,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    // borderWidth: 1,
    // borderColor: 'black',
  },
  image: {
    width: 300,
    height: 200,
  },
  title: {
    fontFamily: bitter.Regular,
    fontSize: size.xxxl,
    color: primary[950],
    marginTop: 80,
  },
})
