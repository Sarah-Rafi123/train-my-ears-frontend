
import React, { useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, className = '', ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <div className="mb-6 relative">
      <div className="relative border-2 border-gray-300 rounded-lg transition-colors duration-200 focus-within:border-blue-500">
        <label
          className={`absolute -top-3 left-4 text-sm font-medium bg-white px-1 transition-colors duration-200 ${
            isFocused ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          {label}
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-4 py-4 pr-12 text-lg text-gray-800 bg-transparent outline-none ${className}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;