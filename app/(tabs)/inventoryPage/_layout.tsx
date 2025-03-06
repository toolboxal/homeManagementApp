import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { blue } from '@/constants/colors'
const InventoryLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Inventory',
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: 'Search inventory',
            barTintColor: 'white',
            tintColor: blue[500],
          },
        }}
      />
    </Stack>
  )
}
export default InventoryLayout
const styles = StyleSheet.create({})
