import { useScreen } from 'app/hook/useScreen'
import { Text, YStack, XStack, Image } from 'tamagui'

type FeatureCardProps = {
  imageUrl: string
  title: string
}

function FeatureCard({ imageUrl, title }: FeatureCardProps) {
  const {isMobile}=useScreen()
  return (
    <YStack 
      alignItems="center"
      width={isMobile?150:250}
      // marginHorizontal={isMobile?2:8}
      backgroundColor="#FFF9F2"
      padding={isMobile?10:20}
       style={{
        borderRadius:16
      }} 


    >
      <YStack 
        width={isMobile?100:200} 
        height={isMobile?100:200} 
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
        fontSize={isMobile?12:14}
        textAlign="center"
      >
        {title}
      </Text>
    </YStack>
  )
}

export function WhyChooseUs() {
  const {isMobile}=useScreen()

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
      paddingTop={isMobile?0:10}
      paddingBottom={40}
      marginBottom={isMobile?10:20}
     
    >
      <Text 
        fontSize={isMobile?20:24} 
        fontWeight="700" 
        color="#2A1A0C"
        marginBottom={isMobile?16:24}
        marginLeft={isMobile?0:8}

      >
        Why Choose Us?
      </Text>
      
      <XStack 
        flexWrap="wrap" 
        justify={"flex-start"}
        gap={16}
        // width={"100%"}
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
