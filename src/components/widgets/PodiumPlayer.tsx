import { View, Text } from "react-native"
import CrownSvg from "@/src/assets/svgs/Crown"
import FirstSvg from "@/src/assets/svgs/First"
import SecondSvg from "@/src/assets/svgs/Second"
import ThirdSvg from "@/src/assets/svgs/Third"

interface PodiumPlayerProps {
  name: string
  initials: string
  position: 1 | 2 | 3
}

export default function PodiumPlayer({ name, initials, position }: PodiumPlayerProps) {
  const getPositionColor = () => {
    switch (position) {
      case 1:
        return "border-yellow-400"
      case 2:
        return "border-gray-400"
      case 3:
        return "border-orange-400"
      default:
        return "border-gray-400"
    }
  }

  const renderBadge = () => {
    switch (position) {
      case 1:
        return <FirstSvg width={24} height={24} />
      case 2:
        return <SecondSvg width={24} height={24} />
      case 3:
        return <ThirdSvg width={24} height={24} />
      default:
        return null
    }
  }

  // Function to truncate name to 10 characters with dots
  const getTruncatedName = (name: string) => {
    if (name.length <= 10) {
      return name
    }
    return name.substring(0, 10) + "..."
  }

  return (
    <View className="items-center">
      {/* Crown for 1st place */}
      {position === 1 && (
        <View className="">
          <CrownSvg width={32} height={24} />
        </View>
      )}

      {/* Player card */}
      <View
        className={`w-20 h-20 ${getPositionColor()} border-4 rounded-3xl bg-white items-center justify-center mb-2 relative`}
      >
        <Text className="text-[#003049] text-xl font-bold">{initials}</Text>

        <View
          className={`absolute -bottom-2 ${
            position === 1 ? "left-1/2 -translate-x-1/2" : position === 2 ? "left-1/2 -translate-x-1/2" : "left-1/2 -translate-x-1/2"
          }`}
        >
          {renderBadge()}
        </View>
      </View>

      {/* Position number */}
      <Text className="text-[#003049] text-3xl font-bold mb-1">{position}</Text>

      {/* Player name - truncated to 10 characters */}
      <Text className="text-[#003049] text-base font-medium">{getTruncatedName(name)}</Text>
    </View>
  )
}