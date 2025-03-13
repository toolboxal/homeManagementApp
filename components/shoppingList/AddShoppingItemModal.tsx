import {
  StyleSheet,
  Text,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { gray, red } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'
import AntDesign from '@expo/vector-icons/AntDesign'
import { capitalize } from '@/utils/capitalize'
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

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={openAddNewItemModal}
      onRequestClose={() => setOpenAddNewItemModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setOpenAddNewItemModal(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.InputContainer}
          >
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
            <Pressable
              style={styles.submitBtn}
              onPress={handleSubmit(onSubmit)}
            >
              <AntDesign name="arrowright" size={24} color={gray[100]} />
            </Pressable>
            {errors.name && (
              <Text style={styles.errorText}>
                {errors.name?.message?.toString()}
              </Text>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default AddShoppingItemModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  InputContainer: {
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: poppins.Regular,
    fontSize: size.md,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingBottom: 15,
    paddingTop: 20,
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
