import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { blue, gray } from '@/constants/colors'
import { oswald, poppins, size } from '@/constants/fonts'
const InventoryLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Inventory',
          presentation: 'card',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: 'Search inventory',
            barTintColor: 'white',
            tintColor: blue[500],
          },
          headerStyle: {
            backgroundColor: gray[50],
          },
          headerTitleStyle: {
            fontFamily: oswald.Regular,
            fontSize: size.lg,
          },
          headerLargeTitleStyle: {
            fontFamily: oswald.SemiBold,
            fontSize: size.xxxl,
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  )
}
export default InventoryLayout
const styles = StyleSheet.create({})
