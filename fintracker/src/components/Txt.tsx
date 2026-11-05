import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts, type, type TypeVariant, type Weight } from '@/theme';

type Props = TextProps & {
  variant?: TypeVariant;
  color?: string;
  weight?: Weight;
  align?: TextStyle['textAlign'];
  tabular?: boolean;
};

/** App text: Outfit, design-system sizes, ink colour by default. */
export function Txt({ variant = 'body', color = colors.ink, weight, align, tabular, style, ...rest }: Props) {
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[
        type[variant],
        { color },
        weight ? { fontFamily: fonts[weight] } : null,
        align ? { textAlign: align } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
    />
  );
}
