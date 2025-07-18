'use client'
import { Button, YStack, Image } from 'tamagui'
import { useRef, useState } from 'react'

export default function UploadImageButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setPreview(imageUrl)
      // TODO: upload the file to server or cloud storage
    }
  }

  return (
    <YStack space="$3" items="center"  >
      {preview && (
        <Image
          source={{ uri: preview }}
          width={150}
          height={150}
          borderRadius={100}
        />
      )}
      <Button type="button"  width={"100%"} onPress={() => inputRef.current?.click()} bg="#4F8CFF" color="white">
        Upload Image
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </YStack>
  )
}
