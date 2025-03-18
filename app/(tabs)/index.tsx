import { useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { blue, gray, green, red } from '@/constants/colors'
import { Recycle, Trash2 } from 'lucide-react-native'
import { poppins, size } from '@/constants/fonts'
import { startOfMonth, startOfYear, format, differenceInDays } from 'date-fns'
import db from '@/db/db'
import { storeItems, TStoreItemSelect } from '@/db/schema'
import { and, eq, gte, lte } from 'drizzle-orm'
import {
  PiggyBank,
  Cookie,
  ChevronRight,
  BatteryLow,
  OctagonAlert,
} from 'lucide-react-native'
import DashBoardModal from '@/components/dashboard/DashBoardModal'
import { fetchStoreItems } from '@/utils/fetchStoreItems'
import { TData } from './inventoryPage'

const IndexPage = () => {
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

  const { data: allStoreItems } = useQuery({
    queryKey: ['store_items'],
    queryFn: async () => {
      return await fetchStoreItems()
    },
  })
  console.log(allStoreItems)
  const { data: storeItemsByDateBought } = useQuery({
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
      })
    },
  })
  // console.log(storeItemsByDateBought)

  const { data: storeItemsByStatusChange } = useQuery({
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
      })
    },
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
    ?.reduce((acc, item) => {
      return acc + parseFloat(item.cost || '0')
    }, 0)
    .toFixed(2)

  // Calculate the date one week from now
  // const oneWeekFromNow = new Date()
  // oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
  // const oneMonthFromNow = new Date()
  // oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30)

  // Find items expiring within the next week
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
            <Text style={styles.figureText}>{totalSpent}</Text>
          </View>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Recycled</Text>
          <View style={styles.figuresBox}>
            <Recycle size={25} color={green[300]} strokeWidth={2.5} />

            <Text style={styles.figureText}>{recycledArr?.length || 0}</Text>
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
            <Text style={styles.figureText}>{disposedArr?.length || 0}</Text>
          </View>
          <Text style={styles.infoText}>
            {disposedWastage?.length === 0
              ? 'Good Job! There are no wastage.'
              : 'Some disposed items has leftovers. What would you change to do better next time?'}
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
            <Text style={styles.figureText}>{expiredFoods?.length || 0}</Text>
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
            <Cookie size={25} color={blue[400]} strokeWidth={2.5} />
            <Text style={styles.figureText}>
              {expiringOneWeek?.length || 0}
            </Text>
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
            <Text style={styles.figureText}>
              {replaceOneMonth?.length || 0}
            </Text>
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
    paddingVertical: 20,
  },
  headerTitleText: {
    fontFamily: poppins.Medium,
    fontSize: size.xxl,
    color: gray[950],
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
    backgroundColor: blue[500],
  },
  selectedFilterText: {
    color: 'white',
    fontFamily: poppins.Medium,
  },
})
