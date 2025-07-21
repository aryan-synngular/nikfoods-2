import UploadImageButton from 'app/admin/food-items/components/UploadButton'
import { clientEnv } from 'data/env/client'
import { useState } from 'react'
import { YStack, XStack, Input, Text, Button, Spinner, TextArea, Label } from 'tamagui'

interface CategoryFormProps {
  initialData?: Partial<ICategory>
  onSuccess?: () => void
  onCancel?: () => void
}

export interface ICategory {
  _id?: string
  name: string
  description?: string
  url: string
  public_id: string
  isImageUpdated: boolean
}

export default function EditCategoryForm({
  initialData = {},
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    url: initialData?.url || '',
    public_id: initialData?.public_id,
    isImageUpdated: false,
  })
  const [file, setFile] = useState<File | null>(null)

  const [errors, setErrors] = useState<string>('')
  const [loading, setLoading] = useState(false)

  function validate() {
    let err = ''
    if (!form.name.trim()) err += 'Category is required. '
    setErrors(err)
    return !err
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors('')

    try {
      let newImage = {}
      if (file) {
        const data = new FormData()
        data.append('file', file)
        data.append('upload_preset', clientEnv.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
        const cloudResp = await fetch(
          `https://api.cloudinary.com/v1_1/${clientEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: data }
        )
        const cloudRespJson = await cloudResp.json()
        console.log(cloudRespJson)

        newImage = {
          url: cloudRespJson?.secure_url ?? '',
          public_id: cloudRespJson?.public_id ?? '',
          isImageUpdated: true,
        }
      }
      let res
      console.log(newImage)
      if (initialData?._id) {
        res = await fetch(`/api/food-category`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            _id: initialData._id,
            ...newImage,
          }),
        })
      } else {
        res = await fetch('/api/food-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, ...newImage }),
        })
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')
      if (onSuccess) onSuccess?.()
    } catch (err: any) {
      setErrors(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: 500 }}>
      <YStack style={{ gap: 16 }}>
        <Text style={{ fontWeight: '700', fontSize: 20, marginBottom: 8 }}>
          {initialData?._id ? 'Edit' : 'Add'} Category
        </Text>
        <YStack>
          {errors && <Text style={{ color: 'red', marginBottom: 8 }}>{errors}</Text>}
          <Label> Category</Label>
          <Input
            placeholder="Category Name"
            value={form.name}
            onChangeText={(name) => setForm((f) => ({ ...f, name }))}
            style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF' }}
          />
        </YStack>
        <YStack>
          <Label>Description *</Label>

          <TextArea
            placeholder="Description"
            value={form.description}
            onChangeText={(description) => setForm((f) => ({ ...f, description }))}
            style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF' }}
          />
        </YStack>
        <UploadImageButton
          handleSetFile={(file) => {
            setFile(file)
          }}
        ></UploadImageButton>

        <XStack mt="$4" style={{ gap: 12 }}>
          <Button
            theme="accent"
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#4F8CFF', color: '#fff', flex: 1 }}
          >
            {loading ? <Spinner color="#fff" /> : 'Save'}
          </Button>
          <Button
            chromeless
            type="button"
            onPress={onCancel}
            variant="outlined"
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
        </XStack>
      </YStack>
    </form>
  )
}
