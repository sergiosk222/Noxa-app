import { G, Defs, Line, LinearGradient, Path, Stop, Svg } from 'react-native-svg';

import { colors } from '@/src/theme';

type NoxaLogoSvgProps = {
  size?: number;
  glow?: boolean;
};

export function NoxaLogoSvg({ size = 160, glow = true }: NoxaLogoSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" fill="none" accessibilityLabel="Noxa geometric N logo">
      <Defs>
        <LinearGradient id="noxaMetalLeft" x1="30" y1="20" x2="62" y2="134" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.24" stopColor="#BFC2C7" />
          <Stop offset="0.58" stopColor="#2A2D33" />
          <Stop offset="1" stopColor="#F1F2F4" />
        </LinearGradient>
        <LinearGradient id="noxaMetalRight" x1="103" y1="22" x2="135" y2="132" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F8FA" />
          <Stop offset="0.28" stopColor="#A8ABB1" />
          <Stop offset="0.66" stopColor="#191B20" />
          <Stop offset="1" stopColor="#E9EAED" />
        </LinearGradient>
        <LinearGradient id="noxaMetalDiagonal" x1="54" y1="26" x2="108" y2="134" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F9FAFB" />
          <Stop offset="0.28" stopColor="#D2D4D8" />
          <Stop offset="0.54" stopColor="#30333A" />
          <Stop offset="0.78" stopColor="#B8BBC1" />
          <Stop offset="1" stopColor="#FFFFFF" />
        </LinearGradient>
        <LinearGradient id="noxaRedBlade" x1="73" y1="45" x2="96" y2="124" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FF6A6A" stopOpacity="0.15" />
          <Stop offset="0.5" stopColor={colors.accent} stopOpacity="1" />
          <Stop offset="1" stopColor="#8B0008" stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id="noxaHorizon" x1="18" y1="132" x2="142" y2="132" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.accent} stopOpacity="0" />
          <Stop offset="0.46" stopColor={colors.accent} stopOpacity="0.92" />
          <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {glow ? (
        <G opacity="0.36">
          <Path d="M31 133H129" stroke={colors.accent} strokeOpacity="0.38" strokeWidth="10" strokeLinecap="round" />
          <Path d="M68 52L94 119" stroke={colors.accent} strokeOpacity="0.34" strokeWidth="16" strokeLinecap="round" />
        </G>
      ) : null}

      <G>
        <Path d="M35 28H55L55 120H35V28Z" fill="url(#noxaMetalLeft)" />
        <Path d="M105 28H125V120H105V28Z" fill="url(#noxaMetalRight)" />
        <Path d="M55 28H76L105 120H84L55 28Z" fill="url(#noxaMetalDiagonal)" />
        <Path d="M78 48H88L101 120H91L78 48Z" fill="url(#noxaRedBlade)" opacity="0.96" />

        <Path d="M35 28H55" stroke="#FFFFFF" strokeOpacity="0.86" strokeWidth="2" strokeLinecap="round" />
        <Path d="M105 28H125" stroke="#FFFFFF" strokeOpacity="0.78" strokeWidth="2" strokeLinecap="round" />
        <Path d="M56 29L85 120" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="1.4" strokeLinecap="round" />
        <Path d="M75 47L100 120" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" />
        <Path d="M55 120H35" stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="2" strokeLinecap="round" />
        <Path d="M125 120H105" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      </G>

      <Line x1="20" y1="132" x2="140" y2="132" stroke="url(#noxaHorizon)" strokeWidth="2" strokeLinecap="round" />
      <Line x1="58" y1="132" x2="102" y2="132" stroke={colors.accent} strokeOpacity="0.86" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}
