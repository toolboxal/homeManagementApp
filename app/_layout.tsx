import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { SQLiteProvider } from 'expo-sqlite'
import {
  useFonts,
  Bitter_100Thin,
  Bitter_200ExtraLight,
  Bitter_300Light,
  Bitter_400Regular,
  Bitter_500Medium,
  Bitter_600SemiBold,
  Bitter_700Bold,
  Bitter_800ExtraBold,
  Bitter_900Black,
  Bitter_100Thin_Italic,
  Bitter_200ExtraLight_Italic,
  Bitter_300Light_Italic,
  Bitter_400Regular_Italic,
  Bitter_500Medium_Italic,
  Bitter_600SemiBold_Italic,
  Bitter_700Bold_Italic,
  Bitter_800ExtraBold_Italic,
  Bitter_900Black_Italic,
} from '@expo-google-fonts/bitter'
import {
  Poppins_100Thin,
  Poppins_100Thin_Italic,
  Poppins_200ExtraLight,
  Poppins_200ExtraLight_Italic,
  Poppins_300Light,
  Poppins_300Light_Italic,
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  Poppins_700Bold_Italic,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
  Poppins_900Black,
  Poppins_900Black_Italic,
} from '@expo-google-fonts/poppins'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import db, { expoDB } from '@/db/db'
import migrations from '@/drizzle/migrations'
import { seedDatabase } from '@/db/seeding'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner-native'
import {
  Oswald_200ExtraLight,
  Oswald_300Light,
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false)
  const [loaded, error] = useFonts({
    Poppins_400Regular_Italic,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Bitter_400Regular,
    Bitter_500Medium,
    Bitter_600SemiBold,
    Bitter_700Bold,
    Oswald_200ExtraLight,
    Oswald_300Light,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  })

  useEffect(() => {
    async function initializeDatabase() {
      try {
        await migrate(db, migrations)
        await seedDatabase()
        setDbReady(true)
      } catch (err) {
        console.error('Database setup failed:', err)
      }
    }
    initializeDatabase()
  }, [])

  useEffect(() => {
    if (dbReady && (loaded || error)) {
      SplashScreen.hideAsync()
    }
  }, [dbReady, loaded, error])

  useDrizzleStudio(expoDB)

  if (!dbReady || (!loaded && !error)) {
    return null
  }

  return (
    <SQLiteProvider databaseName="app.db">
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          <Toaster richColors position="top-center" />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SQLiteProvider>
  )
}
