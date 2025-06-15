import { Platform } from 'react-native'

/**
 * Helper function to get the correct image source based on platform
 * @param imageName Name of the image file (without extension)
 * @param extension Image file extension (default: 'png')
 * @returns The appropriate image source for the current platform
 */
export const getImageSource = (imageName: string, extension: string = 'png') => {
  // For web, use the public directory
  if (Platform.OS === 'web') {
    return { src: `/images/${imageName}.${extension}` }
  }
  
  // For native, use require
  // Note: This requires the image to be in the assets directory
  // and will be bundled with the app
  return Platform.select({
    ios: { src: require(`../assets/${imageName}.${extension}`) },
    android: { src: require(`../assets/${imageName}.${extension}`) },
    default: { src: require(`../assets/${imageName}.${extension}`) },
  })
}
