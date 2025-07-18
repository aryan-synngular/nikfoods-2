'use client';

import {
  List,
LayoutDashboard,
User,
Utensils,
ShoppingCart,


} from '@tamagui/lucide-icons';
import { SidebarDesktop } from './DesktopSidebar';
import { SidebarMobile } from './MobileSidebar';

const sidebarItems: any = {
  links: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Food Items', href: '/admin/food-items', icon: Utensils },
    {
      href: '/admin/food-category',
      icon: List,
      label: 'Food Category',
    },
    {
      href: '/admin/orders',
      icon: ShoppingCart,
      label: 'Orders',
    },
    {
      href: '/admin/all-users',
      icon: User,
      label: 'All Users',
    },
  ],
  
};

import { useMedia } from 'tamagui';

export function Sidebar({open}: {open: boolean}) {
  // Use Tamagui's useMedia to check for desktop view
  const media = useMedia();
  const isDesktop = media.sm;

  if (isDesktop) {
    return <SidebarDesktop sidebarItems={sidebarItems} open={open} />;
  }
  return <SidebarMobile sidebarItems={sidebarItems} open={open} />;

}