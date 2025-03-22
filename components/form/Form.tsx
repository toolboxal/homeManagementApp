import { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { getLocales } from 'expo-localization'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  storeItemsInsertSchema,
  locations,
  spots,
  directions,
  storeItems,
  TStoreItemInsert,
} from '@/db/schema'
import db from '@/db/db'
import { eq } from 'drizzle-orm'
import { gray, primary, red } from '@/constants/colors'
import { poppins, bitter, size } from '@/constants/fonts'
import { add, format } from 'date-fns'
import FormDateModal from './FormDateModal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTagOptions } from '@/db/seeding'
import Chips from '../UI/FormChips'
import PagerView from 'react-native-pager-view'
import { capitalize } from '@/utils/capitalize'
import FormAddBtn from '../UI/FormAddLocBtn'
import AddLocModal from './AddLocModal'
import Entypo from '@expo/vector-icons/Entypo'
import * as Haptics from 'expo-haptics'
import { Tabs, useRouter } from 'expo-router'
import CustomToast from '../UI/CustomToast'
import { toast } from 'sonner-native'
import { useNavigation } from 'expo-router'

const categoryArray = ['food', 'hygiene', 'supplies', 'miscellaneous'] as const
type CategoryType = (typeof categoryArray)[number]

const Form = () => {
  const router = useRouter()
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const pagerRef = useRef<PagerView>(null)
  const today = new Date()
  const [categorySelect, setCategorySelect] = useState<CategoryType>(
    categoryArray[0]
  )
  const [dateBought, setDateBought] = useState(today)
  const [dateExpiry, setDateExpiry] = useState(add(today, { months: 3 }))
  const [openDateModal, setOpenDateModal] = useState(false)
  const [openAddNewLocModal, setOpenAddNewLocModal] = useState(false)
  const [locType, setLocType] = useState<'room' | 'spot' | 'direction'>('room')
  const [storeSelection, setstoreSelection] = useState({
    room: 'kitchen',
    spot: 'cabinet',
    direction: 'top',
  })

  const [dateOption, setDateOption] = useState(0)
  const { currencyCode } = getLocales()[0]

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      pagerRef.current?.setPage(0)
    })
    return unsubscribe
  }, [navigation])

  const { data: tags } = useQuery({
    queryKey: ['tagOptions'],
    queryFn: getTagOptions,
  })
  // console.log(tags)
  const roomsSorted = tags?.allLocations
    ? [...tags.allLocations].sort((a, b) => a.room.localeCompare(b.room))
    : []
  const spotsSorted = tags?.allSpots
    ? [...tags.allSpots].sort((a, b) => a.spot.localeCompare(b.spot))
    : []

  const directionsSorted = tags?.allDirections
    ? [...tags.allDirections].sort((a, b) =>
        a.direction.localeCompare(b.direction)
      )
    : []

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(storeItemsInsertSchema),
    defaultValues: {
      name: '',
      cost: '',
      category: 'food',
      dateBought: format(today, 'yyyy-MM-dd'),
      dateExpiry: format(today, 'yyyy-MM-dd'),
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  // console.log(storeSelection)
  // console.log(locType)
  const onError = () => {
    pagerRef.current?.setPage(0)
  }

  const onSubmit = async (data: z.infer<typeof storeItemsInsertSchema>) => {
    console.log(data)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      // get location,spot,directions id from db
      const [locationResults, spotResults, directionResults] =
        await Promise.all([
          db
            .select({ id: locations.id })
            .from(locations)
            .where(eq(locations.room, storeSelection.room)),
          db
            .select({ id: spots.id })
            .from(spots)
            .where(eq(spots.spot, storeSelection.spot)),
          db
            .select({ id: directions.id })
            .from(directions)
            .where(eq(directions.direction, storeSelection.direction)),
        ])

      // Step 3: Insert store item with the locationId,spotId and directionId
      const storeItemData: TStoreItemInsert = {
        name: data.name,
        dateBought: format(dateBought, 'yyyy-MM-dd'),
        dateExpiry: format(dateExpiry, 'yyyy-MM-dd'),
        cost: data.cost || '0',
        category: categorySelect as
          | 'food'
          | 'hygiene'
          | 'supplies'
          | 'miscellaneous',
        locationId: locationResults[0].id,
        spotId: spotResults[0].id,
        directionId: directionResults[0].id,
      }

      console.log('Inserting pantry item:', storeItemData)

      await db.insert(storeItems).values(storeItemData)

      // Step 4: Success handling (reset form, navigate, etc.)
      console.log('Item added successfully!')
      toast.custom(<CustomToast message="Item saved to inventory" />)
      reset()
      pagerRef.current?.setPage(0)
      queryClient.invalidateQueries({ queryKey: ['store_items'] })
      router.replace('/inventoryPage')
    } catch (error) {
      console.error('Error adding item:', error)
      Alert.alert(
        'Check again',
        'Room, spot or direction chosen might have been previously deleted.'
      )
    }
  }

  return (
    <PagerView
      ref={pagerRef}
      initialPage={0}
      style={{ flex: 1, backgroundColor: primary[50] }}
    >
      <View key={1} style={{ flex: 1, paddingTop: 50 }}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.formContainer}>
            <View style={styles.formSpine}>
              {/* Quotation */}
              <Text style={styles.QuotationText}>
                Tiny steps to make your home a sanctuary of calm.
              </Text>
              {/* Category Selection */}
              <View style={styles.catContainer}>
                {categoryArray.map((category) => (
                  <Pressable
                    key={category}
                    style={
                      category === categorySelect
                        ? styles.catBoxSelect
                        : styles.catBox
                    }
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                      setCategorySelect(category)
                    }}
                  >
                    <Text
                      style={
                        category === categorySelect
                          ? styles.catTextSelect
                          : styles.catText
                      }
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Controller
                name="name"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.textInputBox}>
                    <TextInput
                      onChangeText={onChange}
                      value={value}
                      onBlur={onBlur}
                      style={styles.textInput}
                      placeholder="Product Name"
                      placeholderTextColor={gray[400]}
                    />
                    {errors.name && (
                      <Text style={styles.errorMsg}>{errors.name.message}</Text>
                    )}
                  </View>
                )}
              />

              <View style={styles.costBox}>
                <Text style={styles.currency}>{currencyCode}</Text>
                <Controller
                  name="cost"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={[
                        styles.textInputBox,
                        { flex: 1, marginBottom: 0 },
                      ]}
                    >
                      <TextInput
                        onChangeText={onChange}
                        value={value?.toString() || ''}
                        onBlur={onBlur}
                        style={[styles.textInput, { marginBottom: 0 }]}
                        placeholder="Cost"
                        placeholderTextColor={gray[400]}
                        keyboardType="decimal-pad"
                      />
                      {errors.cost && (
                        <Text style={styles.errorMsg}>
                          {errors.cost.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>
              <View style={styles.datesContainer}>
                <Pressable
                  style={styles.dateBox}
                  onPress={() => {
                    setDateOption(1)
                    setOpenDateModal(true)
                    Keyboard.dismiss()
                  }}
                >
                  <Text style={styles.dateText}>
                    {format(dateBought, 'dd MMM yyyy')}
                  </Text>
                  <Text style={styles.dateLabels}>Date Bought</Text>
                </Pressable>
                <Pressable
                  style={styles.dateBox}
                  onPress={() => {
                    setDateOption(2)
                    setOpenDateModal(true)
                    Keyboard.dismiss()
                  }}
                >
                  <Text style={styles.dateText}>
                    {format(dateExpiry, 'dd MMM yyyy')}
                  </Text>
                  <Text style={styles.dateLabels}>
                    {categorySelect === 'food' ? 'Expiry Date' : 'Shelf Life'}
                  </Text>
                </Pressable>
              </View>
              <FormDateModal
                openDateModal={openDateModal}
                setOpenDateModal={setOpenDateModal}
                date={dateOption === 1 ? dateBought : dateExpiry}
                setDate={dateOption === 1 ? setDateBought : setDateExpiry}
                today={today}
                dateOption={dateOption}
                dateBought={dateBought}
                dateExpiry={dateExpiry}
              />
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.navBtnsContainer, { justifyContent: 'center' }]}
                keyboardVerticalOffset={120}
              >
                <Pressable
                  style={styles.nextBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                    pagerRef.current?.setPage(1)
                  }}
                >
                  <Entypo name="chevron-right" size={24} color={primary[50]} />
                </Pressable>
              </KeyboardAvoidingView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View key={2} style={{ flex: 1, paddingTop: 0 }}>
        <View
          style={{
            marginTop: 15,
            paddingLeft: 22,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: gray[300],
          }}
        >
          <Text style={styles.locationQn}>
            Where do you want to store this item?
          </Text>
          <Text
            style={[
              styles.locationQn,
              {
                fontFamily: bitter.SemiBold,
                fontSize: size.xxl,
                color: primary[600],
              },
            ]}
          >{`${capitalize(storeSelection.room)}`}</Text>
          <Text
            style={[
              styles.locationQn,
              {
                fontFamily: bitter.Medium,
                fontSize: size.lg,
                color: primary[600],
              },
            ]}
          >{`${capitalize(storeSelection.direction)} ${capitalize(
            storeSelection.spot
          )}`}</Text>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSpine}>
            <View style={styles.locationContainer}>
              <View style={styles.locationLabelContainer}>
                <Text
                  style={[
                    styles.locationQn,
                    { fontFamily: bitter.Bold, fontSize: size.sm },
                  ]}
                >
                  ROOM
                </Text>
                <FormAddBtn
                  setOpenAddNewLocModal={setOpenAddNewLocModal}
                  setLocType={setLocType}
                  type="room"
                />
              </View>
              <View style={styles.chipsContainer}>
                {roomsSorted.map((room) => {
                  return (
                    <Chips
                      locationObj={room}
                      key={room.id}
                      storeSelection={storeSelection.room}
                      setStoreSelection={setstoreSelection}
                      category={'room'}
                    />
                  )
                })}
              </View>
            </View>
            <View style={styles.locationContainer}>
              <View style={styles.locationLabelContainer}>
                <Text
                  style={[
                    styles.locationQn,
                    { fontFamily: bitter.Bold, fontSize: size.sm },
                  ]}
                >
                  SPOT
                </Text>
                <FormAddBtn
                  setOpenAddNewLocModal={setOpenAddNewLocModal}
                  setLocType={setLocType}
                  type="spot"
                />
              </View>
              <View style={styles.chipsContainer}>
                {spotsSorted.map((spot) => {
                  return (
                    <Chips
                      locationObj={spot}
                      key={spot.id}
                      storeSelection={storeSelection.spot}
                      setStoreSelection={setstoreSelection}
                      category={'spot'}
                    />
                  )
                })}
              </View>
            </View>
            <View style={styles.locationContainer}>
              <View style={styles.locationLabelContainer}>
                <Text
                  style={[
                    styles.locationQn,
                    { fontFamily: bitter.Bold, fontSize: size.sm },
                  ]}
                >
                  EXACTLY WHERE
                </Text>
                <FormAddBtn
                  setOpenAddNewLocModal={setOpenAddNewLocModal}
                  setLocType={setLocType}
                  type="direction"
                />
              </View>
              <View style={styles.chipsContainer}>
                {directionsSorted.map((direction) => {
                  return (
                    <Chips
                      locationObj={direction}
                      key={direction.id}
                      storeSelection={storeSelection.direction}
                      setStoreSelection={setstoreSelection}
                      category={'direction'}
                    />
                  )
                })}
              </View>
            </View>
          </View>
        </ScrollView>
        <AddLocModal
          openAddNewLocModal={openAddNewLocModal}
          setOpenAddNewLocModal={setOpenAddNewLocModal}
          locType={locType}
        />
        <View style={styles.navBtnsContainer}>
          <Pressable
            style={styles.nextBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
              pagerRef.current?.setPage(0)
            }}
          >
            <Entypo name="chevron-left" size={24} color={primary[50]} />
          </Pressable>

          <Pressable
            style={styles.nextBtn}
            onPress={handleSubmit(onSubmit, onError)}
          >
            <Text style={styles.nextBtnTxt}>Save</Text>
          </Pressable>
        </View>
      </View>
    </PagerView>
  )
}
export default Form
const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    width: '100%',
  },
  formSpine: {
    width: '90%',
    margin: 'auto',
    // backgroundColor: primary[100],
    flex: 1,
  },
  QuotationText: {
    width: '80%',
    fontFamily: bitter.Italic,
    fontSize: size.lg,
    lineHeight: size.xxl,
    marginHorizontal: 'auto',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
    color: primary[300],
  },
  catContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  catBox: {
    width: '20%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  catBoxSelect: {
    width: '20%',
    aspectRatio: 1,
    backgroundColor: primary[400],
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  catText: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    textAlign: 'center',
    color: gray[800],
  },
  catTextSelect: {
    fontFamily: bitter.Regular,
    fontSize: size.sm,
    textAlign: 'center',
    color: 'white',
  },
  textInputBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 12,
    marginBottom: 10,
    position: 'relative',
  },
  textInput: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    backgroundColor: 'white',
    color: gray[700],
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    paddingLeft: 15,
  },
  currency: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: gray[700],
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    // height: 40,
    position: 'relative',
  },
  dateLabels: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: gray[700],
    textAlign: 'center',
    position: 'absolute',
    bottom: -20,
    left: 10,
  },
  dateText: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    color: gray[700],
  },
  locationContainer: {
    marginTop: 20,
  },
  locationQn: {
    fontFamily: bitter.Regular,
    fontSize: size.md,
    color: gray[700],
    marginBottom: 8,
  },
  locationLabelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
    marginBottom: 5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  navBtnsContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'yellow',
  },
  nextBtn: {
    flex: 1,
    maxWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    backgroundColor: primary[400],
    opacity: 0.9,
    borderWidth: 2,
    borderColor: primary[100],
  },
  nextBtnTxt: {
    fontFamily: poppins.Regular,
    fontSize: size.lg,
    color: primary[50],
  },
  errorMsg: {
    fontFamily: poppins.Regular,
    fontSize: size.xxs,
    color: red[700],
    position: 'absolute',
    top: 2,
    left: 15,
  },
})
