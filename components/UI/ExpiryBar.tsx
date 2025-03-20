import { StyleSheet, Text, View } from 'react-native'
import { format, differenceInDays, parseISO } from 'date-fns'
import { gray, red, green, primary } from '@/constants/colors'
import { poppins, size } from '@/constants/fonts'

type Props = {
  dateBought?: string
  dateExpiry?: string
  category?: 'food' | 'hygiene' | 'supplies' | 'miscellaneous'
}

const ExpiryBar = ({ dateBought, dateExpiry, category }: Props) => {
  if (!dateBought || !dateExpiry) return null

  const boughtDate = parseISO(dateBought)
  const expiryDate = parseISO(dateExpiry)
  const today = new Date()

  // Calculate total duration and elapsed time
  const totalDuration = differenceInDays(expiryDate, boughtDate)
  const elapsedDuration = differenceInDays(today, boughtDate)

  // Calculate progress percentage (capped between 0-100)
  const progress = Math.max(
    0,
    Math.min(100, (elapsedDuration / totalDuration) * 100)
  )

  // Determine color based on progress
  const getProgressColor = () => {
    if (progress >= 90) return primary[700]
    if (progress >= 75) return primary[500]
    if (progress >= 50) return primary[300]
    return gray[300]
  }
  //   console.log(elapsedDuration, totalDuration)
  return (
    <View style={styles.barTrack}>
      <Text style={[styles.labels, { left: 5 }]}>Date Bought</Text>
      <Text style={[styles.labels, { right: 5 }]}>
        {category === 'food' ? 'Date Expiry' : 'Replacement Date'}
      </Text>
      <Text style={[styles.labels, { top: -20, left: 5 }]}>
        {format(boughtDate, 'dd MMM yy')}
      </Text>
      <Text style={[styles.labels, { top: -20, right: 5 }]}>
        {format(expiryDate, 'dd MMM yy')}
      </Text>
      <View
        style={[
          styles.barProgress,
          {
            width: `${Math.min(100, progress)}%`,
            backgroundColor: getProgressColor(),
          },
        ]}
      />
    </View>
  )
}

export default ExpiryBar

const styles = StyleSheet.create({
  barTrack: {
    width: '80%',
    marginHorizontal: 'auto',
    marginVertical: 30,
    height: 25,
    backgroundColor: gray[100],
    borderRadius: 30,
    position: 'relative',
  },
  labels: {
    position: 'absolute',
    bottom: -20,
    fontFamily: poppins.Italic,
    fontSize: size.xxs,
    color: gray[700],
  },
  barProgress: {
    position: 'absolute',
    height: 25,
    borderRadius: 30,
    left: 0,
  },
})
