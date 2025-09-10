import React, { useEffect, useRef } from 'react'
import { View, Dimensions, Animated } from 'react-native'

export default function GameSkeleton() {
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
    <View className="flex-1 bg-white px-6">
      {/* Stats Cards Row Skeleton */}
      <View 
        className="flex-row justify-between mb-6"
        style={{
          marginTop: responsiveValue(20),
        }}
      >
        {/* Stat Card 1 */}
        <Animated.View
          style={{
            width: responsiveValue(100),
            height: responsiveValue(80),
            borderRadius: responsiveValue(12),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
            padding: responsiveValue(12),
          }}
        >
          <Animated.View
            style={{
              width: '70%',
              height: responsiveValue(16),
              borderRadius: responsiveValue(8),
              backgroundColor: '#E5E7EB',
              opacity: shimmerOpacity,
              marginBottom: responsiveValue(8),
            }}
          />
          <Animated.View
            style={{
              width: '50%',
              height: responsiveValue(12),
              borderRadius: responsiveValue(6),
              backgroundColor: '#E5E7EB',
              opacity: shimmerOpacity,
            }}
          />
        </Animated.View>

        {/* Stat Card 2 */}
        <Animated.View
          style={{
            width: responsiveValue(100),
            height: responsiveValue(80),
            borderRadius: responsiveValue(12),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
            padding: responsiveValue(12),
          }}
        >
          <Animated.View
            style={{
              width: '70%',
              height: responsiveValue(16),
              borderRadius: responsiveValue(8),
              backgroundColor: '#E5E7EB',
              opacity: shimmerOpacity,
              marginBottom: responsiveValue(8),
            }}
          />
          <Animated.View
            style={{
              width: '50%',
              height: responsiveValue(12),
              borderRadius: responsiveValue(6),
              backgroundColor: '#E5E7EB',
              opacity: shimmerOpacity,
            }}
          />
        </Animated.View>

        {/* Stat Card 3 */}
        <Animated.View
          style={{
            width: responsiveValue(100),
            height: responsiveValue(80),
            borderRadius: responsiveValue(12),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
            padding: responsiveValue(12),
          }}
        >
          <Animated.View
            style={{
              width: '70%',
              height: responsiveValue(16),
              borderRadius: responsiveValue(8),
              backgroundColor: '#E5E7EB',
              opacity: shimmerOpacity,
              marginBottom: responsiveValue(8),
            }}
          />
          <Animated.View
            style={{
              width: '50%',
              height: responsiveValue(12),
              borderRadius: responsiveValue(6),
              backgroundColor: '#E5E7EB',
              opacity: shimmerOpacity,
            }}
          />
        </Animated.View>
      </View>

      {/* Main Content Area Skeleton */}
      <View className="flex-1 justify-center items-center">
        {/* Level/Question Skeleton */}
        <Animated.View
          style={{
            width: responsiveValue(200),
            height: responsiveValue(24),
            borderRadius: responsiveValue(12),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
            marginBottom: responsiveValue(20),
          }}
        />

        {/* Play Button Skeleton */}
        <Animated.View
          style={{
            width: responsiveValue(120),
            height: responsiveValue(120),
            borderRadius: responsiveValue(60),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
            marginBottom: responsiveValue(30),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.View
            style={{
              width: responsiveValue(40),
              height: responsiveValue(40),
              borderRadius: responsiveValue(20),
              backgroundColor: '#E5E7EB',
              opacity: shimmerOpacity,
            }}
          />
        </Animated.View>

        {/* Chord Grid Skeleton */}
        <View 
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: responsiveValue(12),
            marginBottom: responsiveValue(30),
          }}
        >
          {[...Array(8)].map((_, index) => (
            <Animated.View
              key={index}
              style={{
                width: responsiveValue(70),
                height: responsiveValue(50),
                borderRadius: responsiveValue(8),
                backgroundColor: '#F0F4F7',
                opacity: shimmerOpacity,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Animated.View
                style={{
                  width: responsiveValue(40),
                  height: responsiveValue(16),
                  borderRadius: responsiveValue(8),
                  backgroundColor: '#E5E7EB',
                  opacity: shimmerOpacity,
                }}
              />
            </Animated.View>
          ))}
        </View>

        {/* Action Button Skeleton */}
        <Animated.View
          style={{
            width: responsiveValue(250),
            height: responsiveValue(50),
            borderRadius: responsiveValue(25),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
          }}
        />
      </View>

      {/* Bottom Button Skeleton */}
      <View className="pb-6">
        <Animated.View
          style={{
            width: '100%',
            height: responsiveValue(50),
            borderRadius: responsiveValue(25),
            backgroundColor: '#F0F4F7',
            opacity: shimmerOpacity,
          }}
        />
      </View>
    </View>
  )
}