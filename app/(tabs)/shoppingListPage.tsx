import { gray } from '@/constants/colors'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const shoppingListPage = () => {
  return (
    <SafeAreaView style={styles.pageLayout}>
      <Text>shoppingListPage</Text>
    </SafeAreaView>
  )
}

export default shoppingListPage

const styles = StyleSheet.create({
  pageLayout: {
    flex: 1,
    backgroundColor: gray[50],
  },
})
