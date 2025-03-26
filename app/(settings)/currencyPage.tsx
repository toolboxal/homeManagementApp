import { gray, primary } from '@/constants/colors'
import { MoveLeft, X } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  formatCurrency,
  getSupportedCurrencies,
} from 'react-native-format-currency'
import { useRouter } from 'expo-router'
import Entypo from '@expo/vector-icons/Entypo'
import { bitter, poppins, size } from '@/constants/fonts'
import { MMKVStorage } from '@/storage/mmkv'

const currencyList = getSupportedCurrencies()

const currencyPage = () => {
  const router = useRouter()
  const [selectedCur, setSelectedCur] = useState(
    MMKVStorage.getString('user.currency')
  )
  console.log(currencyList)
  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <MoveLeft color={primary[700]} size={25} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.spine}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.HeaderText}>CURRENCIES</Text>
        {currencyList.map((currency, index) => {
          return (
            <Pressable
              onPress={() => {
                setSelectedCur(currency.code)
                MMKVStorage.set('user.currency', currency.code)
              }}
              key={currency.code}
              style={[
                styles.chipBox,
                {
                  backgroundColor:
                    currency.code === selectedCur ? primary[500] : 'white',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Entypo
                  name="dot-single"
                  size={12}
                  color={currency.code === selectedCur ? 'white' : primary[700]}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        currency.code === selectedCur
                          ? primary[50]
                          : primary[700],
                    },
                  ]}
                >
                  {currency.name}
                </Text>
              </View>
              <Pressable
                // onPress={() => mutation.mutate({ type: 'room', id: room.id })}
                pressRetentionOffset={{
                  bottom: 10,
                  left: 10,
                  right: 10,
                  top: 10,
                }}
              >
                <X
                  color={
                    currency.code === selectedCur ? primary[50] : gray[300]
                  }
                  strokeWidth={1.5}
                  size={18}
                />
              </Pressable>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
export default currencyPage
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: primary[50],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    backgroundColor: primary[100],
  },
  spine: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: primary[50],
  },
  HeaderText: {
    fontFamily: bitter.Bold,
    fontSize: size.md,
    color: gray[700],
    marginVertical: 12,
    marginLeft: 3,
  },
  chipBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    // backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipText: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    // color: primary[700],
  },
})
