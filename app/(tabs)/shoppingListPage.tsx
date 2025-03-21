import { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native'
import { primary, gray, red } from '@/constants/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import db from '@/db/db'
import { shoppingList, TShoppingListInsert } from '@/db/schema'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { oswald, poppins, size } from '@/constants/fonts'
import AddShoppingItemModal from '@/components/shoppingList/AddShoppingItemModal'
import { Tabs } from 'expo-router'
import { eq } from 'drizzle-orm'
import * as ContextMenu from 'zeego/context-menu'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Trash2Icon } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

const shoppingListPage = () => {
  const [openAddNewItemModal, setOpenAddNewItemModal] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [selectedItem, setSelectedItem] = useState<
    TShoppingListInsert | undefined
  >(undefined)

  const { data: shoppingListData, refetch } = useQuery({
    queryKey: ['shoppingList'],
    queryFn: () => db.select().from(shoppingList),
  })

  // Sort items so that incomplete items (done=false) appear first
  const sortedShoppingList = shoppingListData
    ? [...shoppingListData].sort((a, b) => Number(a.done) - Number(b.done))
    : []

  const handleDelete = async (id: number) => {
    await db.delete(shoppingList).where(eq(shoppingList.id, id))
    refetch()
  }

  return (
    <SafeAreaView style={styles.pageLayout} edges={[]}>
      <Tabs.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: primary[50],
          },
          headerRight: () => (
            <Pressable
              style={styles.headerRight}
              onPress={() =>
                Alert.alert(
                  'clear list',
                  'Are you sure you want to clear the shopping list?',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'Confirm',
                      onPress: async () => {
                        await db.delete(shoppingList)
                        refetch()
                      },
                    },
                  ]
                )
              }
            >
              <Trash2Icon size={24} color={gray[500]} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.scrollContainer}
        contentContainerStyle={{
          paddingBottom: 70,
          flex: shoppingListData?.length === 0 ? 1 : 0,
        }}
        decelerationRate={'fast'}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBox}>
          <Text style={styles.title}>Shopping List</Text>
        </View>

        {shoppingListData?.length === 0 ? (
          <View style={styles.noItemsBox}>
            <Text style={styles.noItemsTxt}>No items in shopping list</Text>
          </View>
        ) : (
          <View>
            {sortedShoppingList.map((item) => (
              <View key={item.id}>
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <BouncyCheckbox
                      text={item.name}
                      size={25}
                      fillColor={primary[500]}
                      unFillColor={primary[50]}
                      iconStyle={{
                        borderColor: gray[500],
                      }}
                      innerIconStyle={{ borderWidth: StyleSheet.hairlineWidth }}
                      textStyle={{
                        fontFamily: poppins.Medium,
                        fontSize: size.md,
                        textDecorationLine: item.done ? 'line-through' : 'none',
                        color: item.done ? gray[400] : gray[900],
                      }}
                      isChecked={Boolean(item.done)}
                      onPress={async (isChecked: boolean) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                        // Update the done status in the database
                        await db
                          .update(shoppingList)
                          .set({ done: isChecked })
                          .where(eq(shoppingList.id, item.id))
                          .execute()

                        // Refresh the data
                        refetch()
                      }}
                      style={styles.checkBox}
                    />
                  </ContextMenu.Trigger>
                  <ContextMenu.Content>
                    <ContextMenu.Item
                      key="edit"
                      onSelect={() => {
                        setMode('edit')
                        setOpenAddNewItemModal(true)
                        setSelectedItem(item)
                      }}
                    >
                      <ContextMenu.ItemIcon ios={{ name: 'pencil' }} />
                      <ContextMenu.ItemTitle>Edit</ContextMenu.ItemTitle>
                    </ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Item
                      key="delete"
                      onSelect={() => handleDelete(item.id)}
                    >
                      <ContextMenu.ItemIcon ios={{ name: 'trash' }} />
                      <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Pressable
        style={() => styles.addBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          setMode('create')
          setOpenAddNewItemModal(true)
        }}
      >
        <Ionicons name="add-outline" size={30} color={primary[300]} />
      </Pressable>
      <AddShoppingItemModal
        openAddNewItemModal={openAddNewItemModal}
        setOpenAddNewItemModal={setOpenAddNewItemModal}
        mode={mode}
        item={selectedItem}
      />
    </SafeAreaView>
  )
}

export default shoppingListPage

const styles = StyleSheet.create({
  pageLayout: {
    flex: 1,
    backgroundColor: primary[50],
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    // backgroundColor: 'yellow',
  },
  titleBox: {
    width: '100%',
    height: 60,
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: primary[50],
    paddingTop: 10,
  },
  title: {
    fontFamily: oswald.Bold,
    fontSize: size.xxxl,
    color: primary[600],
  },
  noItemsBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noItemsTxt: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: gray[300],
  },
  checkBox: {
    // backgroundColor: gray[100],
    borderRadius: 5,
    marginBottom: 5,
    padding: 10,
    paddingLeft: 15,
  },
  addBtn: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 25,
    right: 25,
  },
  headerRight: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
})
