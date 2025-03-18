import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Tabs } from 'expo-router'
import { blue, gray } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import { Home, Notebook, Plus, ShoppingBag, Trash } from 'lucide-react-native'

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: gray[50],
          borderTopColor: gray[50],
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: poppins.Medium,
          fontSize: size.xs,
        },
        tabBarInactiveTintColor: gray[300],
        tabBarActiveTintColor: gray[800],
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Home size={26} color={`${focused ? gray[800] : gray[300]}`} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventoryPage"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ focused }) => (
            <Notebook size={26} color={`${focused ? gray[800] : gray[300]}`} />
          ),
        }}
      />
      <Tabs.Screen
        name="formPage"
        options={{
          title: 'Form',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: gray[800],
                borderRadius: 100,
              }}
            >
              <Plus size={24} color={gray[50]} strokeWidth={3} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="shoppingListPage"
        options={{
          title: 'ToDos',
          tabBarIcon: ({ focused }) => (
            <ShoppingBag
              size={26}
              color={`${focused ? gray[800] : gray[300]}`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="historyPage"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <Trash size={26} color={`${focused ? gray[800] : gray[300]}`} />
          ),
        }}
      />
    </Tabs>
  )
}
export default TabsLayout
const styles = StyleSheet.create({})
