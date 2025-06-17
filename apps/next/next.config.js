/** @type {import('next').NextConfig} */
const { withTamagui } = require('@tamagui/next-plugin')
const { join } = require('node:path')

const boolVals = {
  true: true,
  false: false,
}

const disableExtraction =
  boolVals[process.env.DISABLE_EXTRACTION] ?? process.env.NODE_ENV === 'development'

const plugins = [
  withTamagui({
    config: '../../packages/config/src/tamagui.config.ts',
    components: ['tamagui', '@my/ui'],
    appDir: true,
    importsWhitelist: ['constants.js', 'colors.js'],
    outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
    logTimings: true,
    disableExtraction,
    shouldExtract: (path) => {
      if (path.includes(join('packages', 'app'))) {
        return true
      }
    },
    disableThemesBundleOptimize: true,
    excludeReactNativeWebExports: ['Switch', 'ProgressBar', 'Picker', 'CheckBox', 'Touchable'],
  }),
]

module.exports = () => {
  /** @type {import('next').NextConfig} */
  let config = {
    typescript: {
      ignoreBuildErrors: true,
    },
    transpilePackages: [
      'solito',
      'react-native-web',
      'expo-linking',
      'expo-constants',
      'expo-modules-core',
    ],
    // Disable React Error Overlay to avoid useReducer hook error with React 19
    reactStrictMode: false,
    // Configure for app directory
    experimental: {
      scrollRestoration: true,
      appDir: true,
    },
    // Disable development overlay that's causing React hook errors
    webpackDevMiddleware: config => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      return config
    },
    // Add webpack configuration to fix React 19 compatibility issues with react-native-web
    webpack: (config, { isServer }) => {
      // Provide polyfills for react-dom methods removed in React 19
      config.resolve.alias = {
        ...config.resolve.alias,
        // Add polyfill for hydrate
        'react-dom/hydrate': require.resolve('./polyfills/react-dom-hydrate.js'),
        // Add polyfill for unmountComponentAtNode
        'react-dom/unmountComponentAtNode': require.resolve('./polyfills/react-dom-unmount.js'),
      }
      
      return config
    },
  }

  for (const plugin of plugins) {
    config = {
      ...config,
      ...plugin(config),
    }
  }

  return config
}
