import type React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native"
import ActionButton from "@/src/components/ui/buttons/ActionButton"

interface LoginRequiredModalProps {
  visible: boolean
  onClose: () => void
  onLogin: () => void
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ visible, onClose, onLogin }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Login Required</Text>
          <Text style={styles.modalText}>Please log in or register to view your stats and save your progress.</Text>
          <View style={styles.buttonContainer}>
            <ActionButton title="Log In/Register" onPress={onLogin} />
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#003049",
  },
  modalText: {
    marginBottom: 25,
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "#003049",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
})
