import { Redirect } from 'expo-router'
import { Text } from 'react-native';

// Note: To prevent font scaling globally, consider creating a custom Text component
// that wraps the default Text with allowFontScaling={false}, and use it throughout the app.
// Direct manipulation of defaultProps is not supported in newer React Native versions with TypeScript.

const index = () => {
  return <Redirect href={'/(tabs)/formPage'} />
}
export default index
