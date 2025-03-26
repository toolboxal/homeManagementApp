import { useState, useEffect } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { primary, gray, green, red } from '@/constants/colors'
import { oswald, poppins, size } from '@/constants/fonts'
import { startOfMonth, startOfYear, format, differenceInDays } from 'date-fns'
import db from '@/db/db'
import { storeItems, TStoreItemSelect } from '@/db/schema'
import { and, gte, lte } from 'drizzle-orm'
import {
  PiggyBank,
  Cookie,
  Recycle,
  Trash2,
  ChevronRight,
  BatteryLow,
  OctagonAlert,
  Wrench,
} from 'lucide-react-native'
import DashBoardModal from '@/components/dashboard/DashBoardModal'
import { fetchStoreItems } from '@/utils/fetchStoreItems'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated'
import { TData } from './inventoryPage'
import { useRouter } from 'expo-router'
import {
  formatCurrency,
  getSupportedCurrencies,
} from 'react-native-format-currency'
import { MMKVStorage } from '@/storage/mmkv'

const IndexPage = () => {
  const router = useRouter()
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
  })
  const [tabSelected, setTabSelected] = useState('month')
  const [openItemModal, setOpenItemModal] = useState(false)
  const [modalDataFeed, setModalDataFeed] = useState<TData[] | null>(null)
  const [modalInfo, setModalInfo] = useState<{
    headerText: string
    description: string
  }>({
    headerText: '',
    description: '',
  })
  const [refreshing, setRefreshing] = useState(false)

  const { data: allStoreItems, refetch: refetchAllItems } = useQuery<
    TData[],
    Error
  >({
    queryKey: ['store_items'],
    queryFn: async () => fetchStoreItems(),
    placeholderData: (previousData) => previousData,
    refetchInterval: 1 * 60 * 60 * 1000, // 1 hour
    refetchIntervalInBackground: true,
  })
  // console.log(allStoreItems)
  const { data: storeItemsByDateBought, refetch: refetchByDateBought } =
    useQuery<TStoreItemSelect[], Error>({
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

  const { data: storeItemsByStatusChange, refetch: refetchByStatusChange } =
    useQuery<TStoreItemSelect[], Error>({
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

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      // Refetch all the queries
      await Promise.all([
        refetchAllItems(),
        refetchByDateBought(),
        refetchByStatusChange(),
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const recycledArr = storeItemsByStatusChange?.filter(
    (item) => item.status === 'recycled'
  )
  const disposedArr = storeItemsByStatusChange?.filter(
    (item) => item.status === 'disposed'
  )
  const recycledWastage = recycledArr?.filter((item) => item.amount !== 'empty')
  const disposedWastage = disposedArr?.filter((item) => item.amount !== 'empty')
  const totalSpent =
    storeItemsByDateBought
      ?.reduce((acc: number, item: TStoreItemSelect) => {
        return acc + parseFloat(item.cost)
      }, 0)
      .toFixed(2) ?? '0'

  const [_, formattedTotalSpent, curSymbol] = formatCurrency({
    amount: parseFloat(totalSpent),
    code: MMKVStorage.getString('user.currency') ?? 'USD',
  })

  const expiringOneWeek = allStoreItems?.filter((item: TData) => {
    if (item.category !== 'food') return false
    const daysLeft = differenceInDays(new Date(item.dateExpiry), new Date())
    return daysLeft <= 7 && daysLeft > 0
  })

  const replaceOneMonth = allStoreItems?.filter((item: TData) => {
    if (item.category === 'food') return false
    const daysLeft = differenceInDays(new Date(item.dateExpiry), new Date())
    return daysLeft <= 30 && daysLeft > 0
  })

  const expiredFoods = allStoreItems?.filter((item: TData) => {
    if (item.category !== 'food') return false
    const daysLeft = differenceInDays(new Date(item.dateExpiry), new Date())
    return daysLeft <= 0
  })
  console.log(expiringOneWeek)

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
      style={{ flex: 1, backgroundColor: primary[50] }}
    >
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitleText}>Dashboard</Text>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => router.push('/settingsPage')}
        >
          <Wrench size={23} color={primary[500]} />
        </Pressable>
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
            style={
              tabSelected === 'month'
                ? styles.selectedFilterText
                : { fontFamily: poppins.Medium, color: primary[600] }
            }
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
          <Text
            style={
              tabSelected === 'year'
                ? styles.selectedFilterText
                : { fontFamily: poppins.Medium, color: primary[600] }
            }
          >
            Year
          </Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ marginTop: 12, gap: 8, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primary[500]}
            colors={[primary[500]]}
            progressBackgroundColor={primary[500]}
          />
        }
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            {`Spent this ${
              tabSelected[0].toUpperCase() + tabSelected.slice(1)
            }`}
          </Text>
          <View style={styles.figuresBox}>
            {/* <PiggyBank size={25} color={gray[700]} strokeWidth={2.5} /> */}
            <AnimatedFigure value={curSymbol} />
            <AnimatedFigure value={formattedTotalSpent} />
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
              ? "Let's do our part!"
              : 'Your intentional effort is saving the environment!'}
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
              ? 'Good Job! There is no wastage.'
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsBtn: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: primary[200],
    marginRight: 2,
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
