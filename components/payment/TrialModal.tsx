import { primary, gray } from '@/constants/colors'
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native'
import { toast } from 'sonner-native'
import CustomToast from '../UI/CustomToast'

import { bitter, poppins, size } from '@/constants/fonts'

type Props = {
  handleStartTrial: () => void
  handleSubscribeNow: () => void
  showTrialModal: boolean
  title: string
  description: Record<string, string>
}

const TrialModal = ({
  handleStartTrial,
  handleSubscribeNow,
  showTrialModal,
  title,
  description,
}: Props) => {
  return (
    <Modal animationType="fade" transparent={true} visible={showTrialModal}>
      <View style={styles.container}>
        <Pressable style={styles.overlay} />
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description.period}</Text>
          <Text style={styles.modalDescription}>{description.desc1}</Text>
          <Pressable
            style={styles.btn}
            onPress={() => {
              handleStartTrial()
              toast.custom(<CustomToast message="Let's start organising!" />)
            }}
          >
            <Text style={styles.btnText}>{description.btn1}</Text>
          </Pressable>
          <Pressable
            style={styles.btn}
            onPress={() => {
              handleSubscribeNow()
              toast.custom(<CustomToast message="You have pro access now" />)
            }}
          >
            <Text style={styles.btnText}>{description.btn2}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

export default TrialModal

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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
