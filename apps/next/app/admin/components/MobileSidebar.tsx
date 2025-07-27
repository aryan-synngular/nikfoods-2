'use client';

import {
  Sheet,
  YStack,
} from 'tamagui';
import { Button } from 'tamagui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


interface SidebarMobileProps {
  sidebarItems: any;
}

export function SidebarMobile({open,sidebarItems}: {open: boolean,sidebarItems: any}) {
  const pathname = usePathname();
console.log(sidebarItems)
  return (
    <Sheet open={open}  modal>
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame>
        <YStack flex={1} bg={"while"}  p="$4" space>
          <YStack mt="$3" space>
            {sidebarItems.links.map((link, idx) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={idx} href={link.href} passHref legacyBehavior>
                  <Button
                    chromeless
                    icon={Icon ? <Icon size={20} /> : undefined}
                    bg={isActive ? "$blue6" : "transparent"}
                    color={isActive ? "$blue12" : undefined}
                    hoverStyle={{ bg: "$blue5" }}
                    size="$4"
                    width="100%"
                  >
                    <span style={{ marginLeft: Icon ? 8 : 0 }}>{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}