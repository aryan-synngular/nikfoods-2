import {
  Anchor,
  AppHeader,
  Button,
  H1,
  HeroBanner,
  Paragraph,
  SearchFood,
  Separator,
  Sheet,
  SwitchRouterButton,
  SwitchThemeButton,
  useToastController,
  XStack,
  YStack,
  CategoryRail,
} from '@my/ui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { Platform } from 'react-native'
import { useLink } from 'solito/navigation'

export function HomeScreen({ pagesMode = false }: { pagesMode?: boolean }) {
  const linkTarget = pagesMode ? '/pages-example-user' : '/user'
  const linkProps = useLink({
    href: `${linkTarget}/nate`,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)

  // Handle search and filter actions
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log('Searching for:', query)
    // Here you would typically fetch or filter data based on the query
  }

  const handleVegToggle = (isVegOnly: boolean) => {
    setVegOnly(isVegOnly)
    console.log('Veg only:', isVegOnly)
    // Here you would typically filter data to show only vegetarian items
  }

  return (
    <YStack flex={1} bg="$background">
      {/* Add AppHeader at the top */}
      <AppHeader />

      {/* On mobile, SearchFood appears at the top */}
      {Platform.OS !== 'web' && (
        <SearchFood
          onSearch={handleSearch}
          onVegToggle={handleVegToggle}
          initialQuery={searchQuery}
          initialVegOnly={vegOnly}
        />
      )}

      {/* HeroBanner only shows on web */}
      <HeroBanner />

      {/* On web, SearchFood appears below the HeroBanner */}
      {Platform.OS === 'web' && (
        <SearchFood
          onSearch={handleSearch}
          onVegToggle={handleVegToggle}
          initialQuery={searchQuery}
          initialVegOnly={vegOnly}
        />
      )}
      <CategoryRail />
      <YStack flex={1} justify="center" items="center" gap="$8" p="$4">
        <XStack
          position="absolute"
          width="100%"
          t="$6"
          gap="$6"
          justify="center"
          flexWrap="wrap"
          $sm={{ position: 'relative', t: 0 }}
        >
          {Platform.OS === 'web' && (
            <>
              <SwitchRouterButton pagesMode={pagesMode} />
              <SwitchThemeButton />
            </>
          )}
        </XStack>

        <YStack gap="$4">
          <H1 text="center" color="$color12">
            Welcome to Tamagui.
          </H1>
          <Paragraph color="$color10" text="center">
            Here's a basic starter to show navigating from one screen to another.
          </Paragraph>
          <Separator />
          <Paragraph text="center">
            This screen uses the same code on Next.js and React Native.
          </Paragraph>
          <Separator />
        </YStack>

        <Button {...linkProps}>Link to user</Button>

        <SheetDemo />
      </YStack>
    </YStack>
  )
}

function SheetDemo() {
  const toast = useToastController()

  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(0)

  return (
    <>
      <Button
        size="$6"
        icon={open ? ChevronDown : ChevronUp}
        circular
        onPress={() => setOpen((x) => !x)}
      />
      <Sheet
        modal
        animation="medium"
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          bg="$shadow4"
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle bg="$color8" />
        <Sheet.Frame items="center" justify="center" gap="$10" bg="$color2">
          <XStack gap="$2">
            <Paragraph text="center">Made by</Paragraph>
            <Anchor color="$blue10" href="https://twitter.com/natebirdman" target="_blank">
              @natebirdman,
            </Anchor>
            <Anchor
              color="$blue10"
              href="https://github.com/tamagui/tamagui"
              target="_blank"
              rel="noreferrer"
            >
              give it a ⭐️
            </Anchor>
          </XStack>

          <Button
            size="$6"
            circular
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
              toast.show('Sheet closed!', {
                message: 'Just showing how toast works...',
              })
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
