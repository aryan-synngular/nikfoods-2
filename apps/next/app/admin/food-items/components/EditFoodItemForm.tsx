import { useState } from 'react'
import { YStack, XStack, Input, Text, Switch, Button, Spinner, TextArea, Label } from 'tamagui'
import { IFoodItem } from 'models/FoodItem'
import { MultiSelect } from 'app/components/ui/MultiSelect'
import { clientEnv } from 'data/env/client'
import UploadImageButton from './UploadButton'

interface EditFoodItemFormProps {
  initialData?: Partial<IFoodItem>
  onSuccess?: () => void
  onCancel?: () => void
  categories: { name: string; label: string }[]
}

export default function EditFoodItemForm({
  initialData = {},
  onSuccess,
  onCancel,
  categories = [],
}: EditFoodItemFormProps) {
  console.log(categories)
  console.log(initialData)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price ?? 0,
    category: initialData?.category || [],
    veg: initialData?.veg ?? true,
    available: initialData?.available ?? true,
    url: initialData?.url || '',
    public_id: initialData?.public_id ?? '',
    isImageUpdated: false,
  })

  const [file, setFile] = useState<File | null>(null)

  const [errors, setErrors] = useState<string>('')
  const [loading, setLoading] = useState(false)

  function validate() {
    let err = ''
    if (!form.name.trim()) err += 'Name is required. \n'
    if (typeof form.price !== 'number' || isNaN(form.price) || form.price < 0)
      err += 'Price must be a greater then Zero. \n'
    if (typeof form.veg !== 'boolean') err += 'Veg must be boolean.\n '
    if (typeof form.available !== 'boolean') err += 'Available must be boolean. \n'
    if (form.category.length == 0) err += 'Atleast 1 category is required.\n '
    setErrors(err)
    return !err
  }

  async function handleSubmit(e: React.FormEvent) {
    console.log(e)
    console.log(form)
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
      console.log(form)
      let res
      if (initialData?._id) {
        res = await fetch(`/api/food-item`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          ...newImage,
          body: JSON.stringify({
            ...form,
            _id: initialData?._id,
            ...newImage,
          }),
        })
      } else {
        res = await fetch('/api/food-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, ...newImage }),
        })
      }
      const data = await res?.json()
      console.log(data)

      if (!res?.ok) throw new Error(data?.error || 'Failed to save')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.log(err)
      setErrors(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (value: string[]) => {
    setForm((prev) => ({ ...prev, category: value as any }))
  }
  return (
    <form onSubmit={handleSubmit} style={{ width: 500 }}>
      <YStack style={{ gap: 12 }}>
        <Text style={{ fontWeight: '700', fontSize: 20, marginBottom: 8 }}>
          {initialData?._id ? 'Edit' : 'Add'} Food Item
        </Text>
        <YStack>
          <Label>Name</Label>
          <Input
            placeholder="Name"
            value={form.name}
            onChangeText={(name) => setForm((f) => ({ ...f, name }))}
            style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF' }}
          />
        </YStack>
        <YStack>
          <Label>Description</Label>
          <TextArea
            placeholder="Description"
            value={form.description}
            onChangeText={(description) => setForm((f) => ({ ...f, description }))}
            style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF' }}
          />
        </YStack>
        <XStack justify={'space-between'}>
          <YStack>
            <Label style={{ minWidth: 80 }}>Category:</Label>
            <MultiSelect
              value={form.category}
              onChange={handleCategoryChange}
              options={categories}
            ></MultiSelect>
          </YStack>

          <YStack>
            <Label>Price</Label>
            <Input
              placeholder="Price"
              value={form.price.toString() == 'NaN' ? '0' : form.price.toString()}
              keyboardType="numeric"
              inputMode="numeric"
              onChangeText={(v) => setForm((f) => ({ ...f, price: Number(v) }))}
              style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF' }}
            />
          </YStack>
        </XStack>
        <XStack gap={'$10'}>
          <XStack items={'center'} gap={4} mt={'$4'}>
            <Text>{form.veg ? 'Veg:' : 'Non-Veg:'}</Text>
            {/* <Switch style={{ backgroundColor: form.veg ? '#5FD068' : '#FF7675' }} /> */}

            <Switch
              size="$4"
              checked={form.veg}
              onCheckedChange={(veg) => setForm((f) => ({ ...f, veg }))}
              bg={form.veg ? '#4caf50' : 'red'}
            >
              <Switch.Thumb animation="quick" bg={form.veg ? 'white' : '#f5f5f5'} />
            </Switch>
          </XStack>
          <XStack items={'center'} gap={4} mt={'$4'}>
            <Text>{form.available ? 'Available:' : 'Unavailable:'}</Text>

            <Switch
              size="$4"
              checked={form.available}
              onCheckedChange={(available) => setForm((f) => ({ ...f, available }))}
              bg={form.available ? '#4caf50' : 'red'}
            >
              <Switch.Thumb animation="quick" bg={form.available ? 'white' : '#f5f5f5'} />
            </Switch>
          </XStack>
        </XStack>
        <YStack mt={'$4'}>
          <UploadImageButton
            handleSetFile={(file) => {
              setFile(file)
            }}
          ></UploadImageButton>
        </YStack>
        {errors && <Text style={{ color: 'red', marginBottom: 8 }}>{errors.trim()}</Text>}
        <XStack mt={'$4'} style={{ gap: 12 }}>
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
