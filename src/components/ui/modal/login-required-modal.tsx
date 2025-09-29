import type React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"

interface LoginRequiredModalProps {
  visible: boolean
  onClose: () => void
  onLogin: () => void
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ visible, onClose, onLogin }) => {
  const { width: screenWidth } = Dimensions.get('window')
  const modalWidth = Math.min(screenWidth * 0.9, 400) // Responsive width with max limit

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { width: modalWidth }]}>
          <Text style={styles.modalTitle}>Login Required</Text>
          <Text style={styles.modalText}>Please log in or register to view your stats and save your progress.</Text>
          <View style={styles.buttonContainer}>
            <View style={styles.loginButtonWrapper}>
              <TouchableOpacity 
                onPress={onLogin} 
                style={styles.loginButton}
                accessibilityRole="button"
                accessibilityLabel="Log In/Register"
              >
                <Text style={styles.loginButtonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  Log In/Register
                </Text>
              </TouchableOpacity>
            </View>
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
    minWidth: 280, // Ensure minimum width for button
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
  loginButtonWrapper: {
    width: "100%",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#003049",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 200, // Ensure minimum width to prevent wrapping
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
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
