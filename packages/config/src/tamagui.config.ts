import { defaultConfig } from '@tamagui/config/v4'
import { createFont, createTamagui } from 'tamagui'
import { bodyFont, headingFont } from './fonts'
import { animations } from './animations'

const interFont = createFont({
  family: 'var(--font-inter)',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 30,
    8: 36,
    9: 48,
    10: 60,
  },
  weight: {
    4: '400',
    5: '500',
    7: '700',
  },
  letterSpacing: {
    4: 0,
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 24,
    4: 28,
    5: 32,
    6: 36,
    7: 42,
    8: 52,
    9: 64,
    10: 76,
  },
})

export const config = createTamagui({
  ...defaultConfig,
  animations,
  fonts: {
    body: interFont,
    heading: interFont,
    mono: interFont,
  },
})
