import { Stack } from 'expo-router'
const formLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="formModal" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
export default formLayout
