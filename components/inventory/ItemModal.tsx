import { useState, useEffect, useRef } from 'react'
import { primary, gray, green, red } from '@/constants/colors'
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native'
import { TData } from '@/app/(tabs)/inventoryPage'
import { bitter, poppins, size } from '@/constants/fonts'
import Slider from '@react-native-community/slider'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import PagerView from 'react-native-pager-view'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTagOptions } from '@/db/seeding'
import Chips from '../UI/FormChips'
import { capitalize } from '@/utils/capitalize'
import db from '@/db/db'
import { shoppingList, storeItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import ExpiryBar from '../UI/ExpiryBar'
import { toast } from 'sonner-native'
import CustomToast from '../UI/CustomToast'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Fontisto from '@expo/vector-icons/Fontisto'
import { format } from 'date-fns'
import * as Haptics from 'expo-haptics'
import { Cookie, Trash2 } from 'lucide-react-native'

type Props = {
  openItemModal: boolean
  setOpenItemModal: React.Dispatch<React.SetStateAction<boolean>>
  selectedItem: TData | null
}

const amount: Record<number, 'empty' | 'low' | 'half' | 'full'> = {
  1: 'empty',
  2: 'low',
  3: 'half',
  4: 'full',
}

const ItemModal = ({
  openItemModal,
  setOpenItemModal,
  selectedItem,
}: Props) => {
  const getSliderValueFromAmount = (
    amount?: 'empty' | 'low' | 'half' | 'full' | null
  ) => {
    return amount === 'full'
      ? 4
      : amount === 'half'
      ? 3
      : amount === 'low'
      ? 2
      : 1
  }
  // console.log(selectedItem)
  const [sliderValue, setSliderValue] = useState(
    getSliderValueFromAmount(selectedItem?.amount)
  )
  const [isChecked, setChecked] = useState(false)
  const [storeSelection, setstoreSelection] = useState({
    room: selectedItem?.location?.room || 'kitchen',
    spot: selectedItem?.spot?.spot || 'cabinet',
    direction: selectedItem?.direction?.direction || 'top',
  })
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<PagerView>(null)
  // console.log(sliderValue)
  // Reset slider value when selectedItem changes or modal opens/closes
  useEffect(() => {
    if (openItemModal && selectedItem) {
      setSliderValue(getSliderValueFromAmount(selectedItem.amount))
      setChecked(false)
      setstoreSelection({
        room: selectedItem.location?.room || 'kitchen',
        spot: selectedItem.spot?.spot || 'cabinet',
        direction: selectedItem.direction?.direction || 'top',
      })
    }
  }, [selectedItem, openItemModal])

  const { data: tags } = useQuery({
    queryKey: ['tagOptions'],
    queryFn: getTagOptions,
  })
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

  const queryClient = useQueryClient()

  const updateItemMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItem?.id) return

      const amountValue = amount[sliderValue]
      if (!amountValue) return

      await db
        .update(storeItems)
        .set({
          amount: amountValue,
          locationId:
            tags?.allLocations.find((loc) => loc.room === storeSelection.room)
              ?.id || null,
          spotId:
            tags?.allSpots.find((spot) => spot.spot === storeSelection.spot)
              ?.id || null,
          directionId:
            tags?.allDirections.find(
              (dir) => dir.direction === storeSelection.direction
            )?.id || null,
        })
        .where(eq(storeItems.id, selectedItem.id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store_items'] })
    },
  })

  const handleClose = () => {
    updateItemMutation.mutate()
    setOpenItemModal(false)
  }

  const handleStatusChange = async (
    status: 'consumed' | 'recycled' | 'disposed',
    id: number
  ) => {
    if (!selectedItem) return

    await db
      .update(storeItems)
      .set({
        status: status,
        dateStatusChange: format(new Date(), 'yyyy-MM-dd'),
      })
      .where(eq(storeItems.id, id))

    queryClient.invalidateQueries({ queryKey: ['store_items'] })
    queryClient.invalidateQueries({ queryKey: ['history'] })
    setOpenItemModal(false)
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={openItemModal}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View
          style={{
            // backgroundColor: 'yellow',
            width: '92%',
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <Pressable
            style={styles.optionBox}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              handleStatusChange('consumed', selectedItem!.id)
            }}
          >
            <Cookie color="white" size={25} strokeWidth={2.5} />
            <Text style={styles.optionTxt}>Consume</Text>
          </Pressable>
          <Pressable
            style={styles.optionBox}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              handleStatusChange('recycled', selectedItem!.id)
            }}
          >
            <Fontisto name="recycle" size={25} color="white" />
            <Text style={styles.optionTxt}>Recycle</Text>
          </Pressable>
          <Pressable
            style={styles.optionBox}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              handleStatusChange('disposed', selectedItem!.id)
            }}
          >
            <Trash2 color="white" size={25} strokeWidth={2} />
            <Text style={styles.optionTxt}>Dispose</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.modalBox]}
        >
          <PagerView ref={pagerRef} initialPage={0} style={{ flex: 1 }}>
            <View key={1}>
              <View style={styles.topBar}>
                <Text style={styles.itemName}>{selectedItem?.name}</Text>
                <Pressable
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    pagerRef.current?.setPage(1)
                    setCurrentPage(1)
                  }}
                >
                  <Text
                    style={{
                      fontFamily: poppins.Regular,
                      fontSize: size.xs,
                      color: gray[900],
                    }}
                  >
                    storage location
                  </Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={gray[900]}
                  />
                </Pressable>
              </View>
              <ExpiryBar
                dateBought={selectedItem?.dateBought}
                dateExpiry={selectedItem?.dateExpiry}
                category={selectedItem?.category || 'food'}
              />
              <View style={styles.sliderBox}>
                <Text style={styles.sliderQn}>
                  How much {selectedItem?.name} is left?
                </Text>
                <Text style={styles.sliderTxt}>{amount[sliderValue]}</Text>
                <Slider
                  minimumValue={1}
                  maximumValue={4}
                  step={1}
                  value={sliderValue}
                  minimumTrackTintColor={gray[900]}
                  maximumTrackTintColor={gray[100]}
                  tapToSeek={true}
                  style={styles.slider}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setSliderValue(value)
                  }}
                  thumbTintColor={'white'}
                />
              </View>

              <View style={[styles.checkboxBox]}>
                <BouncyCheckbox
                  size={23}
                  fillColor={primary[600]}
                  unFillColor="#FFFFFF"
                  text="To buy again?"
                  iconStyle={{ borderColor: primary[600] }}
                  innerIconStyle={{ borderWidth: 1 }}
                  textStyle={{
                    fontFamily: poppins.Regular,
                    fontSize: size.sm,
                    textDecorationLine: 'none',
                  }}
                  onPress={async (isChecked: boolean) => {
                    // console.log(isChecked)
                    if (isChecked) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      await db.insert(shoppingList).values({
                        name: selectedItem?.name || '',
                      })
                      queryClient.invalidateQueries({
                        queryKey: ['shoppingList'],
                      })
                      toast.custom(
                        <CustomToast message="Item added to shopping list" />
                      )
                      setChecked(!isChecked)
                    } else {
                      setChecked(!isChecked)
                    }
                  }}
                />
              </View>
            </View>
            <View key={2}>
              <View style={styles.topBar}>
                <Pressable
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    pagerRef.current?.setPage(0)
                    setCurrentPage(0)
                  }}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={24}
                    color={gray[900]}
                  />
                  <Text
                    style={{
                      fontFamily: poppins.Regular,
                      fontSize: size.xs,
                      color: gray[900],
                    }}
                  >
                    back
                  </Text>
                </Pressable>
                <Text
                  style={[
                    styles.locationQn,
                    {
                      fontFamily: bitter.Medium,
                      fontSize: size.sm,
                      color: primary[600],
                    },
                  ]}
                >{`${capitalize(storeSelection.room)}, ${capitalize(
                  storeSelection.direction
                )} ${capitalize(storeSelection.spot)}`}</Text>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, maxHeight: '85%' }}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View style={styles.locationContainer}>
                  <Text style={styles.locationQn}>ROOM</Text>

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
                  <Text style={styles.locationQn}>SPOT</Text>

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
                  <Text style={styles.locationQn}>EXACTLY WHERE</Text>

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
              </ScrollView>
            </View>
          </PagerView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
export default ItemModal
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  modalBox: {
    minHeight: '38%',
    width: '92%',
    backgroundColor: gray[50],
    borderRadius: 25,
    padding: 20,
    paddingBottom: 5,
    marginHorizontal: 'auto',
    marginBottom: 50,
  },
  topBar: {
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: gray[300],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemName: {
    fontFamily: poppins.Bold,
    fontSize: size.md,
    color: gray[900],
  },
  sliderBox: {
    // backgroundColor: 'yellow',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 15,
    width: '90%',
    marginHorizontal: 'auto',
  },
  slider: {
    width: '100%',
  },
  sliderQn: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    color: gray[700],
    marginBottom: 5,
  },
  sliderTxt: {
    fontFamily: poppins.Bold,
    fontSize: size.md,
    color: primary[600],
  },
  checkboxBox: {
    width: '50%',
    paddingLeft: 18,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    alignSelf: 'flex-start',
  },
  locationContainer: {
    flex: 1,
    marginTop: 10,
    // backgroundColor: 'orange',
  },
  locationQn: {
    fontFamily: bitter.Bold,
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
  optionBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 10,
    width: 70,
    height: 70,
    backgroundColor: primary[500],
  },
  optionTxt: { fontFamily: poppins.Medium, fontSize: size.xxs, color: 'white' },
})
