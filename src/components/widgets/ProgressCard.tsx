import { View, Text } from "react-native"
import FireSvg from "@/src/assets/svgs/Fire"
import TargetSvg from "@/src/assets/svgs/Target"

interface ProgressCardProps {
  icon: "fire" | "target"
  value: string | number
  suffix?: string
  className?: string
  iconColor?: string
}

export default function ProgressCard({ icon, value, suffix = "", className = "", iconColor }: ProgressCardProps) {
  const renderIcon = () => {

    switch (icon) {
      case "fire":
        return <FireSvg/>
      case "target":
        return <TargetSvg />
      default:
        return null
    }
  }

  return (
    <View className={`bg-white border justify-center items-centerborder-gray-200 rounded-2xl p-6 flex-row items-center shadow-sm ${className}`}>
      <View className="mr-3">{renderIcon()}</View>
      <Text className="text-[#003049] text-5xl font-bold">
        {value}
        {suffix && <Text className="text-xl">{suffix}</Text>}
      </Text>
    </View>
  )
}
