import { Text, YStack, XStack, Image } from 'tamagui'

type FeatureCardProps = {
  imageUrl: string
  title: string
}

function FeatureCard({ imageUrl, title }: FeatureCardProps) {
  return (
    <YStack 
      alignItems="center"
      width={150}
      marginHorizontal={8}
    >
      <YStack 
        width={150} 
        height={150} 
        borderRadius={12}
        overflow="hidden"
        marginBottom={10}
      >
        <Image 
          source={{ uri: imageUrl }}
          width="100%"
          height="100%"
          resizeMode="cover"
        />
      </YStack>
      <Text 
        color="#2A1A0C" 
        fontWeight="600"
        fontSize={14}
        textAlign="center"
      >
        {title}
      </Text>
    </YStack>
  )
}

export function WhyChooseUs() {
  const features = [
    {
      id: 1,
      title: "100% Authentic Indian Food",
      imageUrl: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
    },
    {
      id: 2,
      title: "Top High Quality Ingredients",
      imageUrl: "https://images.unsplash.com/photo-1516211881327-e5120a941edc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
    },
    {
      id: 3,
      title: "Timely Deliveries on Fixed Hours",
      imageUrl: "https://images.unsplash.com/photo-1542228262-3d663b306a53?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
    },
    {
      id: 4,
      title: "Clear Fee Easy Pickup",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
    }
  ]

  return (
    <YStack 
      padding={20} 
      paddingTop={10}
      paddingBottom={40}
      backgroundColor="#FFF9F2"
      marginBottom={20}
    >
      <Text 
        fontSize={24} 
        fontWeight="700" 
        color="#2A1A0C"
        marginBottom={24}
        marginLeft={8}
      >
        Why Choose Us?
      </Text>
      
      <XStack 
        flexWrap="wrap" 
        justifyContent="center"
        gap={16}
      >
        {features.map((feature) => (
          <FeatureCard 
            key={feature.id}
            imageUrl={feature.imageUrl}
            title={feature.title}
          />
        ))}
      </XStack>
    </YStack>
  )
}
