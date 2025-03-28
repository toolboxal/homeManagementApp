import { primary, gray } from '@/constants/colors'
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native'
import { PAYWALL_RESULT } from 'react-native-purchases-ui'
import { toast } from 'sonner-native'
import CustomToast from '../UI/CustomToast'

import { bitter, poppins, size } from '@/constants/fonts'

type Props = {
  openItemModal: boolean
  setOpenItemModal: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  description: Record<string, string>
  btnFunc: () => Promise<PAYWALL_RESULT>
}

const AnnoucementModal = ({
  openItemModal,
  setOpenItemModal,
  title,
  description,
  btnFunc,
}: Props) => {
  const handlePaywall = async () => {
    try {
      const result = await btnFunc()

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          // User successfully purchased
          setOpenItemModal(false)
          toast.custom(<CustomToast message="Thank you for subscribing" />)
          break
        case PAYWALL_RESULT.RESTORED:
          // Purchase was restored
          setOpenItemModal(false)
          toast.custom(<CustomToast message="Purchase restored" />)
          break
        case PAYWALL_RESULT.CANCELLED:
          // User cancelled the purchase
          break
        case PAYWALL_RESULT.ERROR:
          // Handle error case
          break
      }
    } catch (error) {
      console.error('Paywall error:', error)
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={openItemModal}
      onRequestClose={() => setOpenItemModal(false)}
    >
      <View style={styles.container}>
        <Pressable style={styles.overlay} />
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description.desc1}</Text>
          <Text style={styles.modalDescription}>{description.period}</Text>
          <Pressable
            style={styles.btn}
            onPress={() => {
              setOpenItemModal(false)
              toast.custom(<CustomToast message="Let's start organising!" />)
            }}
          >
            <Text style={styles.btnText}>{description.btn1}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={handlePaywall}>
            <Text style={styles.btnText}>{description.btn2}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

export default AnnoucementModal

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBox: {
    width: '100%',
    height: '40%',
    backgroundColor: gray[950],
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 25,
  },
  modalTitle: {
    fontFamily: bitter.Regular,
    fontSize: size.xxxl,
    fontWeight: 'bold',
    marginBottom: 15,
    color: primary[50],
    paddingLeft: 10,
  },
  modalDescription: {
    fontFamily: poppins.Regular,
    fontSize: size.md,
    marginBottom: 8,
    color: gray[100],
    paddingLeft: 10,
  },
  btn: {
    padding: 15,
    borderRadius: 100,
    backgroundColor: gray[950],
    marginTop: 15,
    borderWidth: 1,
    borderColor: gray[500],
  },
  btnText: {
    fontFamily: poppins.Medium,
    fontSize: size.md,
    color: primary[50],
    textAlign: 'center',
  },
})
