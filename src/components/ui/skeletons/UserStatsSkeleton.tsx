import React, { useEffect, useRef } from 'react'
import { View, Dimensions, Animated, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '@/src/components/ui/buttons/BackButton'

interface UserStatsSkeletonProps {
  onBack?: () => void
}

export default function UserStatsSkeleton({ onBack }: UserStatsSkeletonProps) {
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
    <SafeAreaView className="flex-1 pt-8 bg-[#F2F5F6]">
      {/* Header with back button */}
      <BackButton onPress={onBack} />

      {/* Blue background section with reduced height */}
      <View className="h-28" />

      {/* Container for overlapping chord card and white section */}
      <View className="flex-1 relative">
        {/* Chord Card Skeleton - positioned to overlap both sections */}
        <View className="absolute -top-16 left-0 right-0 z-10 px-6">
          <Animated.View
            style={{
              width: responsiveValue(128),
              height: responsiveValue(128),
              borderRadius: responsiveValue(64),
              backgroundColor: '#F0F4F7',
              opacity: shimmerOpacity,
              alignSelf: 'center',
            }}
          />
        </View>

        {/* White background section stretching to end of screen */}
        <View className="flex-1 bg-white rounded-t-3xl">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {/* Top padding for chord card */}
            <View className="pt-24">
              {/* Level Selector Skeleton */}
              <View className="px-6 mb-6">
                <View className="flex-row justify-center">
                  <Animated.View
                    style={{
                      width: responsiveValue(280),
                      height: responsiveValue(50),
                      borderRadius: responsiveValue(25),
                      backgroundColor: '#F0F4F7',
                      opacity: shimmerOpacity,
                    }}
                  />
                </View>
              </View>

              {/* Today's Progress Section Skeleton */}
              <View className="px-6 mb-8">
                <Animated.View
                  style={{
                    width: responsiveValue(180),
                    height: responsiveValue(24),
                    borderRadius: responsiveValue(12),
                    backgroundColor: '#F0F4F7',
                    opacity: shimmerOpacity,
                    marginBottom: responsiveValue(16),
                  }}
                />
                
                <View className="bg-[#E5EAED80] rounded-3xl p-4">
                  <View className="flex-row justify-between gap-x-2">
                    {/* Three Stat Cards */}
                    {[...Array(3)].map((_, index) => (
                      <Animated.View
                        key={index}
                        style={{
                          flex: 1,
                          height: responsiveValue(80),
                          borderRadius: responsiveValue(12),
                          backgroundColor: '#F0F4F7',
                          opacity: shimmerOpacity,
                          marginHorizontal: responsiveValue(4),
                          padding: responsiveValue(12),
                        }}
                      >
                        <Animated.View
                          style={{
                            width: '70%',
                            height: responsiveValue(20),
                            borderRadius: responsiveValue(10),
                            backgroundColor: '#E5E7EB',
                            opacity: shimmerOpacity,
                            marginBottom: responsiveValue(8),
                          }}
                        />
                        <Animated.View
                          style={{
                            width: '50%',
                            height: responsiveValue(14),
                            borderRadius: responsiveValue(7),
                            backgroundColor: '#E5E7EB',
                            opacity: shimmerOpacity,
                          }}
                        />
                      </Animated.View>
                    ))}
                  </View>
                </View>
              </View>

              {/* History Section Skeleton */}
              <View className="px-6">
                <Animated.View
                  style={{
                    width: responsiveValue(100),
                    height: responsiveValue(24),
                    borderRadius: responsiveValue(12),
                    backgroundColor: '#F0F4F7',
                    opacity: shimmerOpacity,
                    marginBottom: responsiveValue(16),
                  }}
                />
                
                <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {/* Header Skeleton */}
                  <View className="bg-gray-100 flex-row py-4 px-6">
                    <Animated.View
                      style={{
                        flex: 1,
                        height: responsiveValue(18),
                        borderRadius: responsiveValue(9),
                        backgroundColor: '#E5E7EB',
                        opacity: shimmerOpacity,
                        marginRight: responsiveValue(16),
                      }}
                    />
                    <Animated.View
                      style={{
                        width: responsiveValue(60),
                        height: responsiveValue(18),
                        borderRadius: responsiveValue(9),
                        backgroundColor: '#E5E7EB',
                        opacity: shimmerOpacity,
                        marginRight: responsiveValue(16),
                      }}
                    />
                    <Animated.View
                      style={{
                        width: responsiveValue(80),
                        height: responsiveValue(18),
                        borderRadius: responsiveValue(9),
                        backgroundColor: '#E5E7EB',
                        opacity: shimmerOpacity,
                      }}
                    />
                  </View>

                  {/* Data Rows Skeleton */}
                  <View style={{ maxHeight: 300 }}>
                    {[...Array(5)].map((_, index) => (
                      <View
                        key={index}
                        className={`flex-row py-4 px-6 ${index !== 4 ? "border-b border-gray-100" : ""}`}
                      >
                        <Animated.View
                          style={{
                            flex: 1,
                            height: responsiveValue(16),
                            borderRadius: responsiveValue(8),
                            backgroundColor: '#F0F4F7',
                            opacity: shimmerOpacity,
                            marginRight: responsiveValue(16),
                          }}
                        />
                        <Animated.View
                          style={{
                            width: responsiveValue(60),
                            height: responsiveValue(16),
                            borderRadius: responsiveValue(8),
                            backgroundColor: '#F0F4F7',
                            opacity: shimmerOpacity,
                            marginRight: responsiveValue(16),
                          }}
                        />
                        <Animated.View
                          style={{
                            width: responsiveValue(80),
                            height: responsiveValue(16),
                            borderRadius: responsiveValue(8),
                            backgroundColor: '#F0F4F7',
                            opacity: shimmerOpacity,
                          }}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ height: 32 }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}