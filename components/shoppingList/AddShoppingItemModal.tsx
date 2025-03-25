import {
  StyleSheet,
  Text,
  Modal,
  Pressable,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { gray, primary, red } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import AntDesign from '@expo/vector-icons/AntDesign'
import {
  shoppingList,
  shoppingListInsertSchema,
  TShoppingListInsert,
} from '@/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import db from '@/db/db'
import { useQueryClient } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

type Props = {
  openAddNewItemModal: boolean
  setOpenAddNewItemModal: React.Dispatch<React.SetStateAction<boolean>>
  mode: 'create' | 'edit'
  item?: TShoppingListInsert
}

const AddShoppingItemModal = ({
  openAddNewItemModal,
  setOpenAddNewItemModal,
  mode,
  item,
}: Props) => {
  const queryClient = useQueryClient()

  // Reanimated shared value for the input's vertical offset
  const translateY = useSharedValue(0)

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<TShoppingListInsert>({
    resolver: zodResolver(shoppingListInsertSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (mode === 'edit' && item) {
      setValue('name', item.name)
    } else if (mode === 'create') {
      reset({ name: '' })
    }
  }, [mode, item, setValue, reset])

  const onSubmit = async (data: TShoppingListInsert) => {
    try {
      console.log(data)
      if (mode === 'create') {
        await db.insert(shoppingList).values(data).execute()
      } else if (mode === 'edit' && item?.id) {
        await db
          .update(shoppingList)
          .set(data)
          .where(eq(shoppingList.id, item.id))
          .execute()
      }
      Haptics.NotificationFeedbackType.Success
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
      reset()
      setOpenAddNewItemModal(false)
    } catch (error) {
      console.error('Error inserting shopping list item:', error)
      setError('name', {
        type: 'manual',
        message: 'Failed to add item. Please try again.',
      })
    }
  }

  // Animate the input based on keyboard events
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const keyboardHeight = e.endCoordinates.height
        if (Platform.OS === 'ios') {
          translateY.value = withTiming(-keyboardHeight, {
            duration: 275,
          })
        }
      }
    )

    const keyboardDidHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        if (Platform.OS === 'ios') {
          translateY.value = withTiming(0, { duration: 275 })
        }
      }
    )

    return () => {
      keyboardDidShow.remove()
      keyboardDidHide.remove()
    }
  }, [translateY])

  // Animated style for the input container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Modal
      animationType="fade" // Changed to "fade" for smoother modal appearance
      transparent={true}
      visible={openAddNewItemModal}
      onRequestClose={() => setOpenAddNewItemModal(false)}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => setOpenAddNewItemModal(false)}
      >
        <Animated.View style={[styles.InputContainer, animatedStyle]}>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                value={value}
                onBlur={onBlur}
                style={styles.textInput}
                placeholder={
                  mode === 'create' ? 'create a new item' : 'edit item'
                }
                placeholderTextColor={gray[400]}
                autoFocus={true}
              />
            )}
          />
          <Pressable style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
            <AntDesign name="arrowright" size={24} color={gray[100]} />
          </Pressable>
          {errors.name && (
            <Text style={styles.errorText}>
              {errors.name?.message?.toString()}
            </Text>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  )
}

export default AddShoppingItemModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // Start the input at the bottom
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  InputContainer: {
    backgroundColor: primary[50],
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: poppins.Regular,
    fontSize: size.md,
    backgroundColor: primary[50],
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15, // Unified padding for consistency
    color: gray[700],
    position: 'relative',
  },
  submitBtn: {
    padding: 5,
    backgroundColor: gray[950],
    borderRadius: 100,
    borderColor: gray[100],
    borderWidth: 1,
  },
  errorText: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    position: 'absolute',
    top: 2,
    left: 30,
    color: red[700],
  },
})
