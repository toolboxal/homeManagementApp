import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTagOptions } from '@/db/seeding'
import { router } from 'expo-router'
import { gray, primary } from '@/constants/colors'
import { MoveLeft, X } from 'lucide-react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { bitter, poppins, size } from '@/constants/fonts'
import { capitalize } from '@/utils/capitalize'
import Entypo from '@expo/vector-icons/Entypo'
import db from '@/db/db'
import { locations, spots, directions, storeItems } from '@/db/schema'
import { eq } from 'drizzle-orm'

const chipsPage = () => {
  const queryClient = useQueryClient()
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

  const handleDelete = async ({ type, id }: { type: string; id: number }) => {
    if (type === 'room') {
      const linkedItems = await db
        .select()
        .from(storeItems)
        .where(eq(storeItems.locationId, id))
      if (linkedItems.length > 0) {
        Alert.alert(
          'Unable to Delete',
          'This room has items in it. Please reassign them to another room first.'
        )
        return
      }
      await db.delete(locations).where(eq(locations.id, id))
    } else if (type === 'spot') {
      const linkedItems = await db
        .select()
        .from(storeItems)
        .where(eq(storeItems.spotId, id))
      if (linkedItems.length > 0) {
        Alert.alert(
          'Unable to Delete',
          'This spot has items associated with it. Please reassign them to another spot first.'
        )
        return
      }
      await db.delete(spots).where(eq(spots.id, id))
    } else if (type === 'direction') {
      const linkedItems = await db
        .select()
        .from(storeItems)
        .where(eq(storeItems.directionId, id))
      if (linkedItems.length > 0) {
        Alert.alert(
          'Cannot Delete',
          'This direction has items associated with it. Please reassign them another direction first.'
        )
        return
      }
      await db.delete(directions).where(eq(directions.id, id))
    }
  }

  const mutation = useMutation({
    mutationFn: handleDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagOptions'] })
      queryClient.invalidateQueries({ queryKey: ['location', 'rooms'] })
    },
  })

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
        <Text style={styles.HeaderText}>ROOMS</Text>
        {roomsSorted.map((room) => (
          <Pressable key={room.id} style={styles.chipBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Entypo name="dot-single" size={12} color={primary[900]} />
              <Text style={styles.chipText}>{capitalize(room.room)}</Text>
            </View>
            <Pressable
              onPress={() => mutation.mutate({ type: 'room', id: room.id })}
              pressRetentionOffset={{
                bottom: 10,
                left: 10,
                right: 10,
                top: 10,
              }}
            >
              <X color={gray[300]} strokeWidth={1.5} size={18} />
            </Pressable>
          </Pressable>
        ))}
        <Text style={styles.HeaderText}>SPOTS</Text>
        {spotsSorted.map((spot) => (
          <Pressable key={spot.id} style={styles.chipBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Entypo name="dot-single" size={12} color={primary[900]} />
              <Text style={styles.chipText}>{capitalize(spot.spot)}</Text>
            </View>
            <Pressable
              onPress={() => mutation.mutate({ type: 'spot', id: spot.id })}
              pressRetentionOffset={{
                bottom: 10,
                left: 10,
                right: 10,
                top: 10,
              }}
            >
              <X color={gray[300]} strokeWidth={1.5} size={18} />
            </Pressable>
          </Pressable>
        ))}
        <Text style={styles.HeaderText}>DIRECTIONS</Text>
        {directionsSorted.map((direction) => (
          <Pressable key={direction.id} style={styles.chipBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Entypo name="dot-single" size={12} color={primary[900]} />
              <Text style={styles.chipText}>
                {capitalize(direction.direction)}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                mutation.mutate({ type: 'direction', id: direction.id })
              }
              pressRetentionOffset={{
                bottom: 10,
                left: 10,
                right: 10,
                top: 10,
              }}
            >
              <X color={gray[300]} strokeWidth={1.5} size={18} />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

export default chipsPage

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
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipText: {
    fontFamily: poppins.Regular,
    fontSize: size.sm,
    color: primary[700],
  },
})
