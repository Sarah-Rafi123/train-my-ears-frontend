
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface PersonSvgProps {
  width?: number;
  height?: number;
}

const PersonSvg = ({ width = 18, height = 18 }: PersonSvgProps) => {
  return(
<Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
<Path d="M9 11C6.33 11 1 12.33 1 15V17H17V15C17 12.33 11.67 11 9 11ZM9 9C10.0609 9 11.0783 8.57857 11.8284 7.82843C12.5786 7.07828 13 6.06087 13 5C13 3.93913 12.5786 2.92172 11.8284 2.17157C11.0783 1.42143 10.0609 1 9 1C7.93913 1 6.92172 1.42143 6.17157 2.17157C5.42143 2.92172 5 3.93913 5 5C5 6.06087 5.42143 7.07828 6.17157 7.82843C6.92172 8.57857 7.93913 9 9 9Z" fill="white"/>
</Svg>

  )
}
export default PersonSvg;