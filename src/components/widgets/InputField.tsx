import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

interface InputFieldProps {
  label: string;
  className?: string;

}

const InputField: React.FC<InputFieldProps> = ({ label, className = '', ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <View className="mb-6 relative">
      <View className="relative border-2 border-gray-300 rounded-lg transition-colors duration-200 focus-within:border-blue-500">
        {/* Replace <label> with <Text> */}
        <Text
          className={`absolute -top-3 left-4 text-sm font-medium bg-white px-1 transition-colors duration-200 ${
            isFocused ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          {label}
        </Text>
        {/* Use <TextInput> from React Native instead of <input> */}
        <TextInput
          className={`w-full px-4 py-4 text-lg text-gray-800 bg-transparent outline-none ${className}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </View>
    </View>
  );
};

export default InputField;
