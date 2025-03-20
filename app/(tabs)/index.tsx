import { useState, useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { primary, gray, green, red } from '@/constants/colors'
import { Recycle, Trash2 } from 'lucide-react-native'
import { oswald, poppins, size } from '@/constants/fonts'
import { startOfMonth, startOfYear, format, differenceInDays } from 'date-fns'
import db from '@/db/db'
import { storeItems } from '@/db/schema'
import { and, gte, lte } from 'drizzle-orm'
import {
  PiggyBank,
  Cookie,
  ChevronRight,
  BatteryLow,
  OctagonAlert,
} from 'lucide-react-native'
import DashBoardModal from '@/components/dashboard/DashBoardModal'
import { fetchStoreItems } from '@/utils/fetchStoreItems'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated'

type TStoreItem = {
  id: number
  name: string
  dateBought: string
  dateExpiry: string
  dateStatusChange: string
  cost: string
  status: 'active' | 'consumed' | 'disposed' | 'deleted' | 'recycled' | null
  quantity: string
  amount: 'empty' | 'low' | 'half' | 'full' | null
  category: 'food' | 'hygiene' | 'supplies' | 'miscellaneous' | null
  locationId: number | null
  spotId: number | null
  directionId: number | null
  location: { id: number; room: string } | null
  spot: { id: number; spot: string } | null
  direction: { id: number; direction: string } | null
}

const IndexPage = () => {
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
  })
  const [tabSelected, setTabSelected] = useState('month')
  const [openItemModal, setOpenItemModal] = useState(false)
  const [modalDataFeed, setModalDataFeed] = useState<TStoreItem[] | null>(null)
  const [modalInfo, setModalInfo] = useState<{
    headerText: string
    description: string
  }>({
    headerText: '',
    description: '',
  })

  const { data: allStoreItems } = useQuery({
    queryKey: ['store_items'],
    queryFn: async () => {
      return await fetchStoreItems()
    },
  })
  // console.log(allStoreItems)
  const { data: storeItemsByDateBought } = useQuery<TStoreItem[], Error>({
    queryKey: [
      'store_items_date_bought',
      selectedDateRange.startDate,
      selectedDateRange.endDate,
    ],
    queryFn: async () => {
      const startDateStr = format(selectedDateRange.startDate, 'yyyy-MM-dd')
      const endDateStr = format(selectedDateRange.endDate, 'yyyy-MM-dd')
      return await db.query.storeItems.findMany({
        where: and(
          gte(storeItems.dateBought, startDateStr),
          lte(storeItems.dateBought, endDateStr)
        ),
        with: {
          location: true,
          spot: true,
          direction: true,
        },
      })
    },
  })
  // console.log(storeItemsByDateBought)

  const { data: storeItemsByStatusChange } = useQuery<TStoreItem[], Error>({
    queryKey: [
      'store_items_status_change',
      selectedDateRange.startDate,
      selectedDateRange.endDate,
    ],
    queryFn: async () => {
      const startDateStr = format(selectedDateRange.startDate, 'yyyy-MM-dd')
      const endDateStr = format(selectedDateRange.endDate, 'yyyy-MM-dd')
      return await db.query.storeItems.findMany({
        where: and(
          gte(storeItems.dateStatusChange, startDateStr),
          lte(storeItems.dateStatusChange, endDateStr)
        ),
        with: {
          location: true,
          spot: true,
          direction: true,
        },
      })
    },
    placeholderData: (previousData) => previousData,
  })

  const recycledArr = storeItemsByStatusChange?.filter(
    (item) => item.status === 'recycled'
  )
  const disposedArr = storeItemsByStatusChange?.filter(
    (item) => item.status === 'disposed'
  )
  const recycledWastage = recycledArr?.filter((item) => item.amount !== 'empty')
  const disposedWastage = disposedArr?.filter((item) => item.amount !== 'empty')
  const totalSpent = storeItemsByDateBought
    ?.reduce((acc: number, item: TStoreItem) => {
      return acc + parseFloat(item.cost)
    }, 0)
    .toFixed(2)

  const expiringOneWeek = allStoreItems?.filter((item) => {
    if (item.category === 'food') {
      const expiryDate = new Date(item.dateExpiry)
      const today = new Date()
      const daysUntilExpiry = differenceInDays(expiryDate, today)
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7
    }
    return false
  })
  const replaceOneMonth = allStoreItems?.filter((item) => {
    if (item.category !== 'food') {
      const expiryDate = new Date(item.dateExpiry)
      const today = new Date()
      const daysUntilExpiry = differenceInDays(expiryDate, today)
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
    }
    return false
  })
  const expiredFoods = allStoreItems?.filter((item) => {
    if (item.category === 'food') {
      const expiryDate = new Date(item.dateExpiry)
      const today = new Date()
      const daysUntilExpiry = differenceInDays(expiryDate, today)
      return daysUntilExpiry < 0
    }
    return false
  })
  console.log(expiredFoods)

  // Add shared values for animations
  const animationProgress = useSharedValue(0)

  // Create reusable animated component
  const AnimatedFigure = ({
    value,
  }: {
    value: string | number | undefined
  }) => {
    const animatedStyles = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: interpolate(animationProgress.value, [0, 1], [7, 0]),
          },
        ],
        opacity: interpolate(animationProgress.value, [0, 1], [0, 1]),
      }
    })

    return (
      <Animated.Text style={[styles.figureText, animatedStyles]}>
        {value}
      </Animated.Text>
    )
  }

  // Trigger animation when tab changes
  useEffect(() => {
    animationProgress.value = withSpring(1, {
      damping: 20,
      mass: 2,
    })

    return () => {
      animationProgress.value = 0
    }
  }, [tabSelected])

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: gray[50] }}
    >
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitleText}>Dashboard</Text>
      </View>
      {/* Date Filter */}
      <View style={styles.dateFilterContainer}>
        <Pressable
          id="month"
          style={[
            styles.dateFilterButton,
            tabSelected === 'month' ? styles.selectedFilterButton : {},
          ]}
          onPress={() => {
            setTabSelected('month')
            setSelectedDateRange({
              startDate: startOfMonth(new Date()),
              endDate: new Date(),
            })
          }}
        >
          <Text
            style={tabSelected === 'month' ? styles.selectedFilterText : {}}
          >
            Month
          </Text>
        </Pressable>
        <Pressable
          id="year"
          style={[
            styles.dateFilterButton,
            tabSelected === 'year' ? styles.selectedFilterButton : {},
          ]}
          onPress={() => {
            setTabSelected('year')
            setSelectedDateRange({
              startDate: startOfYear(new Date()),
              endDate: new Date(),
            })
          }}
        >
          <Text style={tabSelected === 'year' ? styles.selectedFilterText : {}}>
            Year
          </Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ flex: 1, marginTop: 12, gap: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            {`Spent this ${
              tabSelected[0].toUpperCase() + tabSelected.slice(1)
            }`}
          </Text>
          <View style={styles.figuresBox}>
            <PiggyBank size={25} color={gray[700]} strokeWidth={2.5} />
            <AnimatedFigure value={totalSpent} />
          </View>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Recycled</Text>
          <View style={styles.figuresBox}>
            <Recycle size={25} color={green[300]} strokeWidth={2.5} />
            <AnimatedFigure value={recycledArr?.length || 0} />
          </View>
          <Text style={styles.infoText}>
            {recycledWastage?.length === 0
              ? "Let's do it!"
              : 'Your intentional effort goes to saving the environment!'}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Disposed</Text>
          <View style={styles.figuresBox}>
            <Trash2 size={25} color={red[300]} strokeWidth={2.5} />
            <AnimatedFigure value={disposedArr?.length || 0} />
          </View>
          <Text style={styles.infoText}>
            {disposedWastage?.length === 0
              ? 'Good Job! There are no wastage.'
              : 'Some leftovers found in disposed items. 😔'}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setModalDataFeed(expiredFoods || null)
            setOpenItemModal(true)
            setModalInfo({
              headerText: 'Expired Food',
              description: 'Go to Inventory to dispose',
            })
          }}
          style={[
            styles.infoBox,
            {
              backgroundColor:
                (expiredFoods?.length || 0) > 0 ? red[50] : 'white',
            },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.infoTitle}>Food already expired</Text>
            <ChevronRight size={18} color={gray[300]} strokeWidth={2.5} />
          </View>
          <View style={styles.figuresBox}>
            <OctagonAlert size={25} color={red[600]} strokeWidth={2.5} />
            <AnimatedFigure value={expiredFoods?.length || 0} />
          </View>
        </Pressable>
        <Pressable
          style={styles.infoBox}
          onPress={() => {
            setModalDataFeed(expiringOneWeek || null)
            setOpenItemModal(true)
            setModalInfo({
              headerText: 'Expiring soon',
              description: 'Check before consumption',
            })
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.infoTitle}>Food expiring in one week</Text>
            <ChevronRight size={18} color={gray[300]} strokeWidth={2.5} />
          </View>

          <View style={styles.figuresBox}>
            <Cookie size={25} color={primary[400]} strokeWidth={2.5} />
            <AnimatedFigure value={expiringOneWeek?.length || 0} />
          </View>
        </Pressable>

        <Pressable
          style={styles.infoBox}
          onPress={() => {
            setModalDataFeed(replaceOneMonth || null)
            setOpenItemModal(true)
            setModalInfo({
              headerText: 'Needs replaceing soon',
              description: "Item's marked for replacing",
            })
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.infoTitle}>Item's shelf life ending soon</Text>
            <ChevronRight size={18} color={gray[300]} strokeWidth={2.5} />
          </View>

          <View style={styles.figuresBox}>
            <BatteryLow size={25} color={gray[400]} strokeWidth={2.5} />
            <AnimatedFigure value={replaceOneMonth?.length || 0} />
          </View>
        </Pressable>
        <DashBoardModal
          openItemModal={openItemModal}
          setOpenItemModal={setOpenItemModal}
          modalDataFeed={modalDataFeed}
          title={modalInfo.headerText}
          description={modalInfo.description}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default IndexPage

const styles = StyleSheet.create({
  headerTitleContainer: {
    // backgroundColor: 'orange',
    padding: 12,
  },
  headerTitleText: {
    fontFamily: oswald.Bold,
    fontSize: size.xxxl,
    color: primary[600],
  },
  scrollContainer: {
    // backgroundColor: 'orange',
  },
  infoBox: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    width: '92%',
    marginHorizontal: 'auto',
    borderRadius: 18,
    flexDirection: 'column',
    shadowColor: gray[950],
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: 'white',
  },
  figuresBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoTitle: {
    fontFamily: poppins.SemiBold,
    fontSize: size.md,
    color: gray[900],
  },
  figureText: {
    fontFamily: poppins.Bold,
    fontSize: size.xxl,
    color: gray[900],
  },
  infoText: {
    fontFamily: poppins.Regular,
    fontSize: size.xs,
    color: gray[600],
  },
  dateFilterContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
  },
  dateFilterButton: {
    borderRadius: 8,
    backgroundColor: gray[100],
    maxWidth: 80,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  selectedFilterButton: {
    backgroundColor: primary[400],
  },
  selectedFilterText: {
    color: 'white',
    fontFamily: poppins.Medium,
  },
})
