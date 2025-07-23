"use client"

import { useState } from 'react'
import { Text, YStack, XStack, Button, Dialog, Image, Checkbox, useMedia } from 'tamagui'
import { X, Check } from '@tamagui/lucide-icons'

interface DeliveryDateOption {
  day: string
  date: string
  fullDate: string
}

interface DeliveryDatePopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selectedDates: {day_name:string,date:string}[]) => void
  item:any
}

export function DeliveryDatePopup({
  open,
  onOpenChange,
  onSelect,
  item
}: DeliveryDatePopupProps) {
  // Generate date options for the next 5 days
  const generateDateOptions = (): DeliveryDateOption[] => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const options: DeliveryDateOption[] = []
    
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const day = days[date.getDay()]
      const dateStr = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()}`
      const fullDate = date.toISOString().split('T')[0] // YYYY-MM-DD format
      
      options.push({ day, date: dateStr, fullDate })
    }
    
    return options
  }
  
  const media = useMedia()
  const dateOptions = generateDateOptions()
  const [selectedDates, setSelectedDates] = useState<{day_name:string,date:string}[]>([])
  
  const handleToggleDate = (val:DeliveryDateOption) => {
    console.log(val)
    setSelectedDates(prev => {
      const data=prev.filter(date => date.day_name !== val.day)
         if(data.length==prev.length)
         {
           return [...prev, {day_name:val.day,date:val.fullDate}]

         }
         else{
          return data
         }
    })
  }
  
  // No longer needed as we check directly in the render
  
  const handleSelect = () => {
    console.log(selectedDates)
    onSelect(selectedDates)
    onOpenChange(false)
  }
  
  const formattedPrice = `$${item?.price?.toFixed(2)}`
  
  return (
    <Dialog
      modal
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            animation: 'lazy',
            opacity: 1
          }}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            maxWidth: 500,
            width: media.sm ? '90%' : 500,
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
            maxHeight: media.sm ? '80vh' : '90vh',
            overflow: 'auto',
            padding: 0
          }}
          animation="medium"
        >
        <YStack style={{ padding: 16, gap: 14 }}>
          {/* Header with title and close button */}
          <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text fontSize={18} fontWeight="600" color="#2A1A0C">
              Choose Delivery date
            </Text>
            <Button
              size="$2"
              circular
              icon={<X size={18} />}
              style={{
                backgroundColor: 'transparent',
              }}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => onOpenChange(false)}
            />
          </XStack>
          
          {/* Food item info */}
          <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <YStack
              width={60}
              height={60}
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#F5F5F5'
              }}
            >
              <Image
                source={{ uri: item?.url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                alt={item?.name}
              />
            </YStack>
            <YStack>
              <Text fontSize={16} fontWeight="600" color="#2A1A0C">
                {item?.name}
              </Text>
              <Text fontSize={16} fontWeight="600" color="#FF9F0D">
                {formattedPrice}
              </Text>
            </YStack>
          </XStack>
          
          {/* Date options */}
          <YStack space={8}>
            {dateOptions.map((option, index) => {
              // Check if this date is selected directly from state each time
              const isSelected = selectedDates.some(day=>day.day_name==option.day)
              
              return (
                <XStack
                  key={option.fullDate}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? '#FF9F0D' : '#E0E0E0',
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: isSelected ? '#FFF8EE' : 'white',
                    cursor: 'pointer',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onPress={() => handleToggleDate(option)}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <XStack style={{ alignItems: 'center', gap: 12 }}>
                    <Checkbox
                      id={`date-${option.fullDate}`}
                      checked={isSelected}
                      // onCheckedChange={() => handleToggleDate(option)}
                      style={{
                        backgroundColor: isSelected ? "#FF9F0D" : "transparent",
                        borderColor: isSelected ? "#FF9F0D" : "#E0E0E0"
                      }}
                      // icon={isSelected ? <Check size={16} color="white" /> : undefined}
                    />
                    <Text fontSize={15} fontWeight="500" color="#2A1A0C">
                      {option.day}
                    </Text>
                  </XStack>
                  <Text fontSize={13} color="#666">
                    {option.date}
                  </Text>
                </XStack>
              )
            })}
          </YStack>
          
          {/* Select button */}
          <Button
            onPress={handleSelect}
            color="white"
            height={46}
            fontSize={15}
            fontWeight="600"
            pressStyle={{ opacity: 0.8 }}
            style={{
              backgroundColor: '#FF9F0D',
              borderRadius: 8,
              marginTop: 8
            }}
            disabled={selectedDates.length === 0}
            opacity={selectedDates.length === 0 ? 0.7 : 1}
          >
            Select
          </Button>
        </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}
