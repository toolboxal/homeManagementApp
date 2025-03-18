import { StyleSheet, Text, View } from 'react-native'
import { Tabs } from 'expo-router'
import { gray } from '@/constants/colors'

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: gray[50], borderTopColor: gray[50] },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="formPage" />
      <Tabs.Screen name="inventoryPage" />
      <Tabs.Screen name="shoppingListPage" />
    </Tabs>
  )
}
export default TabsLayout
const styles = StyleSheet.create({})
