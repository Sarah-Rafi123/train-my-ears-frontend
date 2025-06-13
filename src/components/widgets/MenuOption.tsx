import { TouchableOpacity, Text, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import ViewSampleSvg from "@/src/assets/svgs/ViewSample"
import AdvanceModeSvg from "@/src/assets/svgs/AdvanceMode"
import ViewStatsSvg from "@/src/assets/svgs/ViewStats"
import LeadershipBoardSvg from "@/src/assets/svgs/LeadershipBoard"
import ShareSvg from "@/src/assets/svgs/Share"

interface MenuOptionProps {
  title: string
  // icon: "play" | "sliders" | "stats" | "medal" | "share"
  onPress?: () => void
}

export default function MenuOption({ title, onPress }: MenuOptionProps) {
  // const renderIcon = () => {
  //   const iconSize = 24
  //   const iconColor = "#003049"

  //   switch (icon) {
  //     case "play":
  //       return <ViewSampleSvg size={iconSize} color={iconColor} />
  //     case "sliders":
  //       return <AdvanceModeSvg size={iconSize} color={iconColor} />
  //     case "stats":
  //       return <ViewStatsSvg size={iconSize} color={iconColor} />
  //     case "medal":
  //       return <LeadershipBoardSvg size={iconSize} color={iconColor} />
  //     case "share":
  //       return <ShareSvg size={iconSize} color={iconColor} />
  //     default:
  //       return <Feather name="circle" size={iconSize} color={iconColor} />
  //   }
  // }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center justify-center px-6 py-6 border rounded-2xl border-[#00304940] bg-white mx-4 mb-4"
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.7}
    >
      <View className= " flex flex-row justify-start items-center">
      {/* <View className="w-12 h-12 items-center justify-center mr-2">{renderIcon()}</View> */}
      <Text className="text-[#003049] text-lg font-medium text-center">{title}</Text>
      </View>
    </TouchableOpacity>
  )
}
