"use client"
import { YStack, XStack, Card, Text, H3,H4 } from 'tamagui';
import { LayoutDashboard, Utensils, List, ShoppingCart, CheckCircle, Clock } from '@tamagui/lucide-icons';

const stats = [
  {
    label: 'Total Food Items',
    value: 124,
    icon: Utensils,
    color: '#4F8CFF',
    bg: '#E6F0FF',
  },
  {
    label: 'Food Categories',
    value: 8,
    icon: List,
    color: '#FFB84F',
    bg: '#FFF5E6',
  },
  {
    label: 'Total Orders',
    value: 412,
    icon: ShoppingCart,
    color: '#5FD068',
    bg: '#EBFBEF',
  },
  {
    label: 'Completed Orders',
    value: 390,
    icon: CheckCircle,
    color: '#00B894',
    bg: '#E5FAF4',
  },
  {
    label: 'Upcoming Orders',
    value: 22,
    icon: Clock,
    color: '#FF7675',
    bg: '#FFF0F0',
  },
];

export default function Dashboard() {
  return (
    <YStack space="$6">
      <H4 color="#222" >Dashboard Overview</H4>
      <XStack flexWrap="wrap" gap={24}  px={6}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              bordered
              elevate
              size="$4"
              width={240}
              items={"center"}
              height={120}
          
              borderColor={stat.bg}
              backgroundColor={stat.bg}
              pressStyle={{ scale: 0.97 }}
              marginBottom={24}
              marginRight={24}
            >
              <XStack space alignItems="center" height="100%">
                <YStack alignItems="center" justifyContent="center" width={56} height={56} borderRadius={28} backgroundColor={stat.color+"22"}>
                  <Icon size={28} color={stat.color} />
                </YStack>
                <YStack ml={12}>
                  <Text fontSize={28} fontWeight="700" color={stat.color}>{stat.value}</Text>
                  <Text fontSize={15} fontWeight={"600"} color={stat.color}>{stat.label}</Text>
                </YStack>
              </XStack>
            </Card>
          );
        })}
      </XStack>
    </YStack>
  );
}