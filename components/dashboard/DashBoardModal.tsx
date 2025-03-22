import { primary, gray } from '@/constants/colors'
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native'
import { format } from 'date-fns'
import { poppins, size } from '@/constants/fonts'
import { TData } from '@/app/(tabs)/inventoryPage'
import { capitalize } from '@/utils/capitalize'

type Props = {
  openItemModal: boolean
  setOpenItemModal: React.Dispatch<React.SetStateAction<boolean>>
  modalDataFeed: TData[] | null
  title: string
  description: string
}

const DashBoardModal = ({
  openItemModal,
  setOpenItemModal,
  modalDataFeed,
  title,
  description,
}: Props) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={openItemModal}
      onRequestClose={() => setOpenItemModal(false)}
    >
      <View style={styles.container}>
        <Pressable
          style={styles.overlay}
          onPress={() => setOpenItemModal(false)}
        />
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {modalDataFeed && modalDataFeed.length > 0 ? (
              modalDataFeed.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetail}>
                      Expires on:{' '}
                      {format(new Date(item.dateExpiry), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      gap: 1,

                      flex: 1,
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={styles.itemDetail}>
                      {capitalize(item.location?.room || 'Unassigned')}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <Text style={styles.itemDetail}>
                        {capitalize(item.direction?.direction || 'Unknown')}
                      </Text>
                      <Text style={styles.itemDetail}>
                        {capitalize(item.spot?.spot || 'Unknown')}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No item found</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

export default DashBoardModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalBox: {
    width: '92%',
    height: '40%',
    backgroundColor: gray[950],
    borderRadius: 25,
    marginBottom: 50,
    padding: 15,
    paddingHorizontal: 10,
    paddingBottom: 40, // Extra padding at bottom to clear tab bar
    shadowColor: gray[950],
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalTitle: {
    fontFamily: poppins.Bold,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: primary[50],
    paddingLeft: 10,
  },
  modalDescription: {
    fontFamily: poppins.Italic,
    fontSize: size.sm,
    marginBottom: 8,
    color: gray[200],
    paddingLeft: 10,
  },
  scrollContainer: {
    flex: 1,
    borderRadius: 10,
  },
  itemContainer: {
    padding: 12,
    backgroundColor: gray[700],
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontFamily: poppins.SemiBold,
    fontSize: size.sm,
    fontWeight: '600',
    marginBottom: 4,
    color: gray[50],
  },
  itemDetail: {
    fontFamily: poppins.Medium,
    fontSize: size.xs,
    color: primary[200],
    // marginBottom: 2,
  },
  emptyText: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    textAlign: 'center',
    color: gray[500],
    marginTop: 20,
  },
})
