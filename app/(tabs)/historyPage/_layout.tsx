import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { blue, gray } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
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
            tintColor: blue[500],
          },
          headerStyle: {
            backgroundColor: gray[50],
          },
          headerTitleStyle: {
            fontFamily: poppins.Regular,
            fontSize: size.md,
          },
          headerLargeTitleStyle: {
            fontFamily: poppins.Regular,
            fontSize: size.xxl,
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  )
}
export default InventoryLayout
const styles = StyleSheet.create({})
