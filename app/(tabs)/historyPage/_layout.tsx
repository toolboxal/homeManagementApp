import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { primary, gray } from '@/constants/colors'
import { oswald, poppins, size } from '@/constants/fonts'
const InventoryLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Purchase History',
          presentation: 'card',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: 'Search history',
            barTintColor: 'white',
            tintColor: primary[600],
          },
          headerStyle: {
            backgroundColor: primary[50],
          },
          headerTitleStyle: {
            fontFamily: oswald.Regular,
            fontSize: size.lg,
            color: primary[600],
          },
          headerLargeTitleStyle: {
            fontFamily: oswald.Bold,
            fontSize: size.xxxl,
            color: primary[600],
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  )
}
export default InventoryLayout
const styles = StyleSheet.create({})
