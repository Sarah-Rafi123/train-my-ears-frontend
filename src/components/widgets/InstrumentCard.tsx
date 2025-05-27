import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import GuitarSVG from "@/src/assets/svgs/Guitar"; // Ensure these are SVG components
import PianoSVG from "@/src/assets/svgs/Piano";

interface InstrumentCardProps {
  instrument: "guitar" | "piano";
  onPress?: () => void;
}

export default function InstrumentCard({ instrument, onPress }: InstrumentCardProps) {
  const getInstrumentSource = () => {
    return instrument === "guitar" ? <GuitarSVG /> : <PianoSVG />;
  };

  const getInstrumentName = () => {
    return instrument === "guitar" ? "Guitar" : "Piano";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <View className="items-center justify-between p-4 flex flex-col ">
        <View >
          {getInstrumentSource()}
        </View>
      </View>
    </TouchableOpacity>
  );
}
