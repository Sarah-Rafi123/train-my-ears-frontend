"use client"
import { View, ScrollView, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import BackButton from "@/src/components/ui/buttons/BackButton"
import MenuOption from "@/src/components/widgets/MenuOption"
import FeedbackModal from "@/src/components/ui/modal/feedback-modal"
import { LoginRequiredModal } from "@/src/components/ui/modal/login-required-modal" // Import the new modal
import { useAuth } from "@/src/context/AuthContext"
import { revenueCatService } from "@/src/services/revenueCatService"

interface MenuScreenProps {
  onBack?: () => void
  onViewSample?: () => void
  onAdvanceMode?: () => void
  onViewStats?: () => void
  onLeaderboard?: () => void
  onShare?: () => void
}

export default function MenuScreen({
  onBack,
  onViewSample,
  onAdvanceMode,
  onViewStats,
  onLeaderboard,
  onShare,
}: MenuScreenProps) {
  const navigation = useNavigation()
  const { user } = useAuth()
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false) // New state for login modal
  const [canCancelSubscription, setCanCancelSubscription] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    isYearlySubscription?: boolean;
    canDowngradeFromYearly?: boolean;
    daysSincePurchase?: number;
  }>({})

  // Check subscription status when component mounts or user changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        try {
          const subInfo = await revenueCatService.getActiveSubscriptionInfo()
          setHasSubscription(subInfo.hasSubscription)
          setCanCancelSubscription(subInfo.canCancel)
          setSubscriptionInfo({
            isYearlySubscription: subInfo.isYearlySubscription,
            canDowngradeFromYearly: subInfo.canDowngradeFromYearly,
            daysSincePurchase: subInfo.daysSincePurchase
          })
          
          console.log('🔍 [MenuScreen] Subscription status:', {
            hasSubscription: subInfo.hasSubscription,
            canCancel: subInfo.canCancel,
            daysSincePurchase: subInfo.daysSincePurchase,
            isYearly: subInfo.isYearlySubscription,
            canDowngradeFromYearly: subInfo.canDowngradeFromYearly
          })
        } catch (error) {
          console.error('❌ [MenuScreen] Error checking subscription status:', error)
        }
      }
    }

    checkSubscriptionStatus()
  }, [user])

  const handleViewSample = () => {
    console.log("View Sample pressed")
    onViewSample?.()
    navigation.navigate("Sample" as never)
  }

  const handleAdvanceMode = () => {
    console.log("Advance Mode pressed")
    onAdvanceMode?.()
    // Navigate to appropriate screen based on authentication status
    const advanceScreenName = user ? 'Advance' : 'AdvanceGuest'
    navigation.navigate(advanceScreenName as never)
    console.log(`🎮 Navigating to ${advanceScreenName}`, { userId: !!user, isGuest: !user })
  }

  const handleViewStats = () => {
    console.log("View Stats pressed")
    onViewStats?.()
    if (!user) {
      // If user is not logged in, show the modal
      setShowLoginRequiredModal(true)
    } else {
      // If user is logged in, navigate to Stats screen
      navigation.navigate("Stats" as never)
    }
  }

  const handleLeaderboard = () => {
    console.log("Leaderboard pressed")
    onLeaderboard?.()
    navigation.navigate("Leaderboard" as never)
  }

  const handleShare = () => {
    console.log("Share pressed")
    onShare?.()
    // Implement share functionality
  }

  const handleShareFeedback = () => {
    console.log("Share Feedback pressed")
    console.log("👤 Current user email:", user?.email || "No email (anonymous)")
    setFeedbackModalVisible(true)
  }

  const handleViewFeedback = () => {
    console.log("View Feedback pressed")
    navigation.navigate("ViewFeedback" as never)
  }

  const handleSubscription = () => {
    console.log("Subscription pressed")
    navigation.navigate("RevenueCatScreen" as never)
  }

  const handleBack = () => {
    console.log("Back pressed")
    onBack?.()
    navigation.goBack()
  }

  const handleLoginFromModal = () => {
    setShowLoginRequiredModal(false)
    navigation.navigate("Register" as never) // Navigate to your registration/login screen
  }

  const handleCancelSubscription = async () => {
    console.log("Cancel Subscription pressed")
    try {
      const success = await revenueCatService.cancelSubscription()
      if (success) {
        console.log('✅ [MenuScreen] Successfully redirected to subscription management')
      } else {
        console.error('❌ [MenuScreen] Failed to open subscription management')
      }
    } catch (error) {
      console.error('❌ [MenuScreen] Error cancelling subscription:', error)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center px-6 py-4">
        <BackButton onPress={handleBack} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-4 px-4 gap-y-2">
          <MenuOption title="My Stats" onPress={handleViewStats} />
          <MenuOption title="Advanced Play" onPress={handleAdvanceMode} />
          <MenuOption title="Sample Chords" onPress={handleViewSample} />
          <MenuOption title="Leader Board" onPress={handleLeaderboard} />
          {user && <MenuOption title="Subscription" onPress={handleSubscription} />}
          {user && canCancelSubscription && <MenuOption title="Cancel Subscription" onPress={handleCancelSubscription} />}
          <MenuOption title="Share" onPress={handleShare} />
          <MenuOption title="Share Feedback" onPress={handleShareFeedback} />
          {/* Small text for View Feedback */}
          <View className="mt-6 px-2">
            <Text
              className="text-sm text-[#003049] hover:font-bold hover:text-black underline text-center"
              onPress={handleViewFeedback}
            >
              View Feedback
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        userEmail={user?.email}
      />

      {/* Login Required Modal */}
      <LoginRequiredModal
        visible={showLoginRequiredModal}
        onClose={() => setShowLoginRequiredModal(false)}
        onLogin={handleLoginFromModal}
      />
    </SafeAreaView>
  )
}
