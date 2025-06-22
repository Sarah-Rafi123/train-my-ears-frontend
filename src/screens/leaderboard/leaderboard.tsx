import { View, Text, ScrollView, Animated, Dimensions } from "react-native"
import { useState, useEffect, useCallback, useRef } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import BackButton from "@/src/components/ui/buttons/BackButton"
import LevelSelector from "@/src/components/widgets/LevelSelector"
import LeaderboardRow from "@/src/components/widgets/LeaderBoardRow"
import { leaderboardApi, leaderboardUtils, LeaderboardUser } from "@/src/services/leaderBoardApi"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface LeaderboardScreenProps {
  navigation?: any
  route?: any 
  onBack?: () => void
}

// Confetti Component (same as before)
const ConfettiPiece = ({ delay, color, shape }) => {
  const translateY = useRef(new Animated.Value(-50)).current
  const translateX = useRef(new Animated.Value(Math.random() * screenWidth)).current
  const rotate = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(1)).current
  const scale = useRef(new Animated.Value(Math.random() * 0.5 + 0.5)).current

  useEffect(() => {
    const startAnimation = () => {
      translateY.setValue(-50)
      opacity.setValue(1)
      
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight + 100,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 360,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(startAnimation, Math.random() * 1000)
      })
    }

    setTimeout(startAnimation, delay)
  }, [delay])

  const getConfettiShape = () => {
    switch (shape) {
      case 'circle':
        return { width: 8, height: 8, borderRadius: 4, backgroundColor: color }
      case 'square':
        return { width: 6, height: 6, backgroundColor: color }
      case 'triangle':
        return {
          width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 8,
          borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color,
        }
      case 'star':
        return { width: 10, height: 10, backgroundColor: color, transform: [{ rotate: '45deg' }] }
      default:
        return { width: 8, height: 3, backgroundColor: color }
    }
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          transform: [
            { translateX }, { translateY },
            { rotate: rotate.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
            { scale },
          ],
          opacity,
        },
        getConfettiShape(),
      ]}
    />
  )
}

const ConfettiBackground = ({ isActive }) => {
  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE']
  const confettiShapes = ['circle', 'square', 'triangle', 'rectangle', 'star']

  if (!isActive) return null

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
      {Array.from({ length: 50 }).map((_, index) => (
        <ConfettiPiece
          key={index}
          delay={Math.random() * 3000}
          color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
          shape={confettiShapes[Math.floor(Math.random() * confettiShapes.length)]}
        />
      ))}
    </View>
  )
}

export default function LeaderboardScreen({ navigation, onBack }: LeaderboardScreenProps) {
  const [selectedMode, setSelectedMode] = useState<"simple" | "advanced">("simple")
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleLevelChange = async (level: number) => {
    try {
      console.log(`🎯 Level change requested: ${selectedLevel} → ${level}`)
      
      if (level === selectedLevel) {
        console.log('Same level selected, skipping fetch')
        return
      }

      if (level < 1 || level > 4) {
        console.error(`Invalid level: ${level}. Must be between 1 and 4`)
        setError(`Invalid level: ${level}`)
        return
      }

      setError(null)
      setSelectedLevel(level)
      setLoading(true)
      
      console.log(`📡 Fetching leaderboard data for level ${level}`)
      
      const response = await leaderboardApi.getLeaderboard(level, 'combined')
      
      if (response.success) {
        const userData = response.data.topUsers
        const top3Users = userData.slice(0, 3)
        setLeaderboardData(top3Users)
        console.log(`✅ Successfully loaded top ${top3Users.length} users for level ${level}`)
        
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 8000)
      } else {
        throw new Error('API returned unsuccessful response')
      }
      
    } catch (err) {
      console.error(`❌ Error fetching level ${level} data:`, err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard data'
      setError(errorMessage)
      setLeaderboardData([])
    } finally {
      setLoading(false)
      console.log(`🏁 Level change completed for level ${level}`)
    }
  }

  useEffect(() => {
    handleLevelChange(1)
  }, [])

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else if (navigation) {
      navigation.goBack()
    } else {
      console.log("Back pressed, but navigation is not available")
    }
  }, [onBack, navigation])

  const podiumPlayers = leaderboardUtils.getPodiumPlayers(leaderboardData)
  
  const getTop3LeaderboardRows = () => {
    if (leaderboardData.length === 0) {
      return Array.from({ length: 3 }, (_, index) => ({
        place: index + 1,
        name: "User",
        streak: 0,
        accuracy: "0%"
      }))
    }
    
    const rows = leaderboardData.map(user => ({
      place: user.rank,
      name: user.userName,
      streak: user.currentStreak,
      accuracy: leaderboardUtils.formatAccuracy(user.accuracy)
    }))
    
    while (rows.length < 3) {
      rows.push({
        place: rows.length + 1,
        name: "User",
        streak: 0,
        accuracy: "0%"
      })
    }
    
    return rows.slice(0, 3)
  }

  const leaderboardRows = getTop3LeaderboardRows()

  // 3D EFFECT PODIUM STAND DESIGN
  const ThreeDPodiumStand = ({ name, position, stats }) => {
    const getPositionConfig = (pos) => {
      switch (pos) {
        case 1:
          return {
            color: '#FFD700',
            darkColor: '#DAA520',
            lightColor: '#FFFF99',
            height: 120,
            emoji: '👑',
            title: 'CHAMPION',
            shadow: '#FFD700'
          }
        case 2:
          return {
            color: '#C0C0C0',
            darkColor: '#A0A0A0',
            lightColor: '#E0E0E0',
            height: 100,
            emoji: '🥈',
            title: 'RUNNER-UP',
            shadow: '#C0C0C0'
          }
        case 3:
          return {
            color: '#CD7F32',
            darkColor: '#A0522D',
            lightColor: '#DEB887',
            height: 80,
            emoji: '🥉',
            title: 'THIRD PLACE',
            shadow: '#CD7F32'
          }
        default:
          return {
            color: '#E5E7EB',
            darkColor: '#D1D5DB',
            lightColor: '#F3F4F6',
            height: 60,
            emoji: '🏆',
            title: 'PARTICIPANT',
            shadow: '#E5E7EB'
          }
      }
    }

    const config = getPositionConfig(position)

    return (
      <View style={{ alignItems: 'center', flex: 1, zIndex: 2 }}>
        {/* 3D Player Card with multiple shadow layers */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 16,
          alignItems: 'center',
          minWidth: position === 1 ? 180 : 140,
          marginBottom: 8,
          borderWidth: 2,
          borderColor: config.color,
          // Multiple shadow layers for 3D effect
          shadowColor: config.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
          // Perspective transform
          transform: [
            { perspective: 1000 },
            { rotateX: '-5deg' },
            { rotateY: position === 2 ? '5deg' : position === 3 ? '-5deg' : '0deg' },
          ],
        }}>
          {/* Additional shadow layer */}
          <View style={{
            position: 'absolute',
            top: 4,
            left: 4,
            right: -4,
            bottom: -4,
            backgroundColor: config.shadow,
            borderRadius: 20,
            opacity: 0.2,
            zIndex: -1,
          }} />
          
          {/* Crown/Medal with 3D glow */}
          <View style={{
            shadowColor: config.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 5,
          }}>
            <Text style={{ 
              fontSize: position === 1 ? 32 : 24, 
              marginBottom: 8,
              textShadowColor: config.shadow,
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4,
            }}>
              {config.emoji}
            </Text>
          </View>
          
          <Text style={{
            color: config.color,
            fontSize: position === 1 ? 12 : 10,
            fontWeight: 'bold',
            letterSpacing: 1,
            marginBottom: 4,
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}>
            {config.title}
          </Text>
          
          <Text style={{
            color: '#003049',
            fontSize: position === 1 ? 16 : 14,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 8,
            textShadowColor: 'rgba(0,0,0,0.1)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 1,
          }} numberOfLines={2}>
            {name}
          </Text>
          
          {stats && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                color: '#6B7280',
                fontSize: 12,
                fontWeight: '500'
              }}>
                🔥 {stats.streak} • 🎯 {stats.accuracy}
              </Text>
            </View>
          )}
        </View>

        {/* 3D Podium Stand Base with gradient effect */}
        <View style={{
          width: position === 1 ? 120 : 100,
          height: config.height,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          // 3D perspective
          transform: [
            { perspective: 1000 },
            { rotateX: '10deg' },
            { rotateY: position === 2 ? '3deg' : position === 3 ? '-3deg' : '0deg' },
          ],
          // Multiple shadow layers
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
          {/* Gradient background layers for 3D effect */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '30%',
            backgroundColor: config.lightColor,
          }} />
          <View style={{
            position: 'absolute',
            top: '30%',
            left: 0,
            right: 0,
            height: '40%',
            backgroundColor: config.color,
          }} />
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            backgroundColor: config.darkColor,
          }} />
          
          {/* Side highlight for 3D effect */}
          <View style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 4,
            height: '100%',
            backgroundColor: config.lightColor,
            opacity: 0.7,
          }} />
          
          {/* Bottom shadow for depth */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }} />

          {/* Position Number with 3D text effect */}
          <Text style={{
            color: position === 2 ? '#000' : '#fff',
            fontSize: position === 1 ? 36 : 28,
            fontWeight: 'bold',
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
            zIndex: 10,
          }}>
            {position}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <ConfettiBackground isActive={showConfetti} />
      
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 16,
          zIndex: 3
        }}>
          <BackButton onPress={handleBack} />
          <View style={{ flex: 1 }}>
            <Text style={{
              color: '#003049',
              fontSize: 24,
              fontWeight: '600',
              textAlign: 'center',
              marginTop: 16,
              marginRight: 40
            }}>
              🏆 Leaderboard
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, zIndex: 2 }} showsVerticalScrollIndicator={false}>
          <LevelSelector 
            selectedLevel={selectedLevel} 
            onLevelChange={handleLevelChange}
            maxLevel={4}
            loading={loading}
            disabled={loading}
          />

          {loading && (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ color: '#003049', fontSize: 16 }}>
                Loading top 3 players...
              </Text>
            </View>
          )}

          {error && (
            <View style={{
              alignItems: 'center',
              paddingVertical: 16,
              marginHorizontal: 24,
              backgroundColor: '#fef2f2',
              borderRadius: 8,
              padding: 16
            }}>
              <Text style={{ color: '#dc2626', fontSize: 16, fontWeight: '500' }}>Error</Text>
              <Text style={{ color: '#ef4444', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                {error}
              </Text>
            </View>
          )}

          {/* 3D PODIUM DISPLAY */}
          {!loading && !error && (
            <View style={{
              marginBottom: 32,
              paddingHorizontal: 16,
              paddingTop: 20,
              zIndex: 2
            }}>
              <Text style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: '#003049',
                marginBottom: 24,
                textShadowColor: 'rgba(0,0,0,0.1)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2
              }}>
                🎖️ TOP PERFORMERS 🎖️
              </Text>

              {/* 3D Podium Stand Layout */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingHorizontal: 10,
                // Add perspective to the container
                transform: [{ perspective: 1200 }],
              }}>
                <ThreeDPodiumStand 
                  name={podiumPlayers[0].name} 
                  position={2}
                  stats={{
                    streak: leaderboardData[1]?.currentStreak || 0,
                    accuracy: leaderboardUtils.formatAccuracy(leaderboardData[1]?.accuracy || 0)
                  }}
                />
                
                <ThreeDPodiumStand 
                  name={podiumPlayers[1].name} 
                  position={1}
                  stats={{
                    streak: leaderboardData[0]?.currentStreak || 0,
                    accuracy: leaderboardUtils.formatAccuracy(leaderboardData[0]?.accuracy || 0)
                  }}
                />
                
                <ThreeDPodiumStand 
                  name={podiumPlayers[2].name} 
                  position={3}
                  stats={{
                    streak: leaderboardData[2]?.currentStreak || 0,
                    accuracy: leaderboardUtils.formatAccuracy(leaderboardData[2]?.accuracy || 0)
                  }}
                />
              </View>

              {/* 3D Podium Base with depth */}
              <View style={{
                height: 20,
                backgroundColor: '#E5E7EB',
                marginTop: -1,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
                transform: [{ perspective: 1000 }, { rotateX: '5deg' }],
              }}>
                {/* Additional depth layer */}
                <View style={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  right: -2,
                  bottom: -2,
                  backgroundColor: '#D1D5DB',
                  borderRadius: 8,
                  zIndex: -1,
                }} />
              </View>
            </View>
          )}

          {/* Leaderboard Table */}
          {!loading && (
            <View style={{
              marginHorizontal: 24,
              backgroundColor: 'white',
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
              zIndex: 2
            }}>
              <View style={{
                backgroundColor: '#f3f4f6',
                flexDirection: 'row',
                paddingVertical: 16,
                paddingHorizontal: 24
              }}>
                <Text style={{ color: '#003049', fontWeight: '600', width: 48 }}>Place</Text>
                <Text style={{ color: '#003049', fontWeight: '600', flex: 1, marginLeft: 8, marginRight: 8 }}>Name</Text>
                <Text style={{ color: '#003049', fontWeight: '600', marginLeft: 16, textAlign: 'center' }}>Streak</Text>
                <Text style={{ color: '#003049', fontWeight: '600', width: 80, marginLeft: 8, textAlign: 'center' }}>Accuracy</Text>
              </View>

              {leaderboardRows.map((player, index) => (
                <LeaderboardRow
                  key={`level-${selectedLevel}-rank-${player.place}-${index}`}
                  place={player.place}
                  name={player.name}
                  streak={player.streak}
                  accuracy={player.accuracy}
                />
              ))}
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}