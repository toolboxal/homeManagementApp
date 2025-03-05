import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Form from '@/components/form/Form'

const formPage = () => {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Form />
    </SafeAreaView>
  )
}
export default formPage
const styles = StyleSheet.create({})
