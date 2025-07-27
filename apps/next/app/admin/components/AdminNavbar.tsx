import { XStack, YStack, Text, Button, Avatar,useMedia } from 'tamagui';
import { Menu } from '@tamagui/lucide-icons';

interface AdminNavbarProps {
  onMenuClick?: () => void;
}

export function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  return (
    <XStack
      bg="$background"
      py="$2"
      px="$4"
      borderBottomWidth={1}
      borderColor="$borderColor"
      width={ "100%" }
      shadowColor="$shadowColor"
      shadowOpacity={0.05}
      justify={"space-between"}
      items={"center"}

    >
      {/* Hamburger for mobile */}
     <Button
        chromeless
        size="$3"
        circular
        onPress={onMenuClick}
        display="flex"
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </Button>

      <XStack space>
        <Avatar circular size="$2">
          <Avatar.Image src="/avatar.png" />
          <Avatar.Fallback bg="$blue6" />
        </Avatar>
      </XStack>
    </XStack>
  );
}
