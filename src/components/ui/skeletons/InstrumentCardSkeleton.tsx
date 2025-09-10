import React, { useEffect, useRef } from 'react'
import { View, Dimensions, Animated } from 'react-native'

export default function InstrumentCardSkeleton() {
  const screenWidth = Dimensions.get("window").width
  const BASE_WIDTH = 375
  const scaleFactor = screenWidth / BASE_WIDTH
  const responsiveValue = (value: number) => Math.round(value * scaleFactor)

  const shimmerAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start()
    }
    startAnimation()
  }, [shimmerAnimation])

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <View
      style={{
        borderRadius: responsiveValue(8),
        paddingVertical: responsiveValue(20),
        paddingHorizontal: responsiveValue(32),
        marginBottom: responsiveValue(16),
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#00304920',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {/* Icon skeleton - circular like typical instrument icons */}
        <Animated.View
          style={{
            width: responsiveValue(30),
            height: responsiveValue(30),
            borderRadius: responsiveValue(15),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
          }}
        />
        {/* Text skeleton - slightly wider to match "Guitar Chord" / "Piano Chord" */}
        <Animated.View
          style={{
            width: responsiveValue(140),
            height: responsiveValue(20),
            borderRadius: responsiveValue(10),
            marginLeft: responsiveValue(16),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
          }}
        />
      </View>
    </View>
  )
}