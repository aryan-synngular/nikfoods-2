import { createFont } from 'tamagui'

export const headingFont = createFont({
  size: {
    6: 15,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  weight: {
    6: '400',
    7: '700',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
    14: -5,
    15: -6,
  },
  face: {
    400: { normal: 'Nunito_400Regular' },
    500: { normal: 'Nunito_500Medium' },
    600: { normal: 'Nunito_600SemiBold' },
    700: { normal: 'Nunito_700Bold' },
    800: { normal: 'Nunito_800ExtraBold' },
    900: { normal: 'Nunito_900Black' },
  },
})

export const bodyFont = createFont({
  family: 'Nunito',
  face: {
    400: { normal: 'Nunito_400Regular' },
    500: { normal: 'Nunito_500Medium' },
    600: { normal: 'Nunito_600SemiBold' },
    700: { normal: 'Nunito_700Bold' },
    800: { normal: 'Nunito_800ExtraBold' },
    900: { normal: 'Nunito_900Black' },
  },
  // Define size and line height directly in the size object
  size: {
    // Define specific sizes
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 30,
    10: 42,
    11: 52,
    12: 62,
  },
  lineHeight: {
    1: 15,
    2: 17,
    3: 19,
    4: 21,
    5: 24,
    6: 28,
    7: 32,
    8: 36,
    9: 45,
    10: 55,
    11: 65,
    12: 75,
  },
})
