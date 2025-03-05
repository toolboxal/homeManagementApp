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
  locationInsertSchema,
  spotInsertSchema,
  directionInsertSchema,
  locations,
  spots,
  directions,
} from '@/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import db from '@/db/db'
import { useQueryClient } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'

type Props = {
  openAddNewLocModal: boolean
  setOpenAddNewLocModal: React.Dispatch<React.SetStateAction<boolean>>
  locType: 'room' | 'spot' | 'direction'
}

const AddLocModal = ({
  openAddNewLocModal,
  setOpenAddNewLocModal,
  locType,
}: Props) => {
  const queryClient = useQueryClient()

  // Get the field name based on locType
  const getFieldName = () => {
    switch (locType) {
      case 'room':
        return 'room'
      case 'spot':
        return 'spot'
      case 'direction':
        return 'direction'
      default:
        return 'room'
    }
  }

  const fieldName = getFieldName()

  // Use a type assertion to handle the different form types
  let form: any

  if (locType === 'room') {
    const {
      control,
      handleSubmit,
      reset,
      setError,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(locationInsertSchema),
      defaultValues: {
        room: '',
      },
    })

    form = { control, handleSubmit, reset, setError, errors }
  } else if (locType === 'spot') {
    const {
      control,
      handleSubmit,
      reset,
      setError,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(spotInsertSchema),
      defaultValues: {
        spot: '',
      },
    })

    form = { control, handleSubmit, reset, setError, errors }
  } else {
    const {
      control,
      handleSubmit,
      reset,
      setError,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(directionInsertSchema),
      defaultValues: {
        direction: '',
      },
    })

    form = { control, handleSubmit, reset, setError, errors }
  }

  const { control, handleSubmit, reset, setError, errors } = form

  const formatInput = (input: string): string => {
    return input.trim().toLowerCase().replace(/\s+/g, '_')
  }

  const onSubmit = async (data: any) => {
    const value = data[fieldName]

    if (value === '') {
      console.log('cannot be empty field')
      setError(fieldName, { type: 'min', message: 'cannot be empty' })
      return
    } else if (value.length > 15) {
      console.log('too long!!!!')
      setError(fieldName, { type: 'max', message: 'exceed 15 characters' })
      return
    }

    // Format the input data
    const formattedValue = formatInput(value)

    try {
      // Check for duplicates and insert based on locType
      let existingItems = []

      switch (locType) {
        case 'room':
          existingItems = await db
            .select()
            .from(locations)
            .where(eq(locations.room, formattedValue))

          if (existingItems.length === 0) {
            await db.insert(locations).values({ room: formattedValue })
          }
          break

        case 'spot':
          existingItems = await db
            .select()
            .from(spots)
            .where(eq(spots.spot, formattedValue))

          if (existingItems.length === 0) {
            await db.insert(spots).values({ spot: formattedValue })
          }
          break

        case 'direction':
          existingItems = await db
            .select()
            .from(directions)
            .where(eq(directions.direction, formattedValue))

          if (existingItems.length === 0) {
            await db.insert(directions).values({ direction: formattedValue })
          }
          break
      }

      // If any matching records are found, show an error
      if (existingItems.length > 0) {
        console.log('Duplicate found:', value)
        setError(fieldName, {
          type: 'duplicate',
          message: `This ${value} already exists`,
        })
        return
      }

      // Invalidate and refetch tagOptions query
      await queryClient.invalidateQueries({ queryKey: ['tagOptions'] })
      reset()
      setOpenAddNewLocModal(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const getPlaceholderText = () => {
    switch (locType) {
      case 'room':
        return 'create a new room'
      case 'spot':
        return 'create a new spot'
      case 'direction':
        return 'create a new direction'
      default:
        return 'create a new item'
    }
  }

  const placeholderTxt = getPlaceholderText()

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={openAddNewLocModal}
      onRequestClose={() => setOpenAddNewLocModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setOpenAddNewLocModal(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.InputContainer}
          >
            <Controller
              name={fieldName}
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onChangeText={onChange}
                  value={value}
                  onBlur={onBlur}
                  style={styles.textInput}
                  placeholder={capitalize(placeholderTxt)}
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
            {errors[fieldName] && (
              <Text style={styles.errorText}>
                {errors[fieldName]?.message?.toString()}
              </Text>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
export default AddLocModal
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
