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
import { useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

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

  // Reanimated shared value for the input's vertical offset
  const translateY = useSharedValue(0)

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
      defaultValues: { room: '' },
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
      defaultValues: { spot: '' },
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
      defaultValues: { direction: '' },
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
      setError(fieldName, { type: 'min', message: 'cannot be empty' })
      return
    } else if (value.length > 15) {
      setError(fieldName, { type: 'max', message: 'exceed 15 characters' })
      return
    }

    const formattedValue = formatInput(value)
    try {
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

      if (existingItems.length > 0) {
        setError(fieldName, {
          type: 'duplicate',
          message: `${value} already exists`,
        })
        return
      }
      Haptics.NotificationFeedbackType.Success
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

  // Animate the input based on keyboard events
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const keyboardHeight = e.endCoordinates.height
        // Only animate on iOS, Android handles this automatically
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
        // Only animate on iOS, Android handles this automatically
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
      animationType="fade"
      transparent={true}
      visible={openAddNewLocModal}
      onRequestClose={() => setOpenAddNewLocModal(false)}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => setOpenAddNewLocModal(false)}
      >
        <Animated.View style={[styles.InputContainer, animatedStyle]}>
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
          <Pressable style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
            <AntDesign name="arrowright" size={24} color={gray[100]} />
          </Pressable>
          {errors[fieldName] && (
            <Text style={styles.errorText}>
              {errors[fieldName]?.message?.toString()}
            </Text>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  )
}

export default AddLocModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end', // Start the input at the bottom
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
    paddingVertical: 15,
    color: gray[700],
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
