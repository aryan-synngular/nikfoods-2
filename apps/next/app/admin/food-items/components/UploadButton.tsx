'use client'
import { Button, YStack, Image, XStack } from 'tamagui'
import { useRef, useState } from 'react'

export default function UploadImageButton({
  handleSetFile,
}: {
  handleSetFile: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleSetFile(file)
      const imageUrl = URL.createObjectURL(file)
      console.log(imageUrl)
      setPreview(imageUrl)

      // TODO: upload the file to server or cloud storage
    }
  }

  return (
    <XStack space="$3" gap={'$3'} items="center">
      <Button type="button" onPress={() => inputRef.current?.click()} bg="#4F8CFF" color="white">
        Upload Image
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {preview && <Image source={{ uri: preview }} width={150} height={150} borderRadius={25} />}
    </XStack>
  )
}
