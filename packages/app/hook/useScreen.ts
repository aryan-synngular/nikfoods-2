import { useMedia } from '@my/ui'
import { Platform } from 'react-native'

export function useScreen(){
  const media=useMedia()
const isMobile= Platform.OS !== 'web' 
const isMobileWeb=Platform.OS == 'web'&& (media.maxXs || media.maxSm)
  return  {isMobile,isMobileWeb}
}