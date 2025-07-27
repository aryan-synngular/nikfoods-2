'use client';
import Link from 'next/link';
import { YStack, XStack, Button, Avatar, Text, Image } from 'tamagui';
import { usePathname } from 'next/navigation';
interface SidebarDesktopProps {
  sidebarItems: any;
  open:boolean
}

export function SidebarDesktop(props: SidebarDesktopProps) {
  const pathname = usePathname();

  const { links, extras } = props.sidebarItems;
  const isOpen = props.open;
  return (
    <YStack
      width={isOpen?270:100}
      height="100vh"
      borderRightWidth={1}
      borderColor="$borderColor"
      bg="$background"
      transition='ease-in-out'
      
      p={isOpen?"$4":"$3"}
      space
    >
      <YStack>
        <YStack
        mt={isOpen?-15:0}
          justify={"center"}
          items={"center"}
        >

        <Image
            source={{ uri: '/images/logo.png' }}
            alt="nikfoods logo"
            width={isOpen?160:60}
            height={isOpen?60:30}
            resizeMode="contain"
            />
            </YStack>
          
        <YStack items={"flex-start"} mt={isOpen?16:24}  justify={"flex-end"} gap={isOpen?12:20} >
          {links.map((link, index) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={index} href={link.href} passHref legacyBehavior>
                <Button
                  chromeless
                  justify={isOpen?"flex-start":"center"}
                  // alignItems="flex-start"
                  icon={Icon ? <Icon size={isOpen?20:24} /> : undefined}
                  bg={isActive ? "$blue6" : "transparent"}
                  color={isActive ? "$blue12" : undefined}
                  hoverStyle={{ bg: "$blue5" }}
                  // marginVertical="$2"
                  size="$4"
                  width="100%"
                >
                  {isOpen&&<Text ml={Icon ? "$2" : 0}>{link.label}</Text>}
                </Button>
              </Link>
            );
          })}
        </YStack>
      </YStack>
      
    </YStack>
  );
}