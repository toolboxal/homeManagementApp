import { StyleSheet, Text, View } from 'react-native'
import { router, Stack } from 'expo-router'

const SettingsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="settingsPage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chipsPage"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}
export default SettingsLayout
const styles = StyleSheet.create({})
