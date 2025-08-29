import { useState } from 'react'
import { YStack, XStack, Input, Text, Switch, Button, Spinner, TextArea, Label, ScrollView } from 'tamagui'
import { MultiSelect } from 'app/components/ui/MultiSelect'
import { clientEnv } from 'data/env/client'
import UploadImageButton from './UploadButton'
import { IFoodItem } from 'app/types/foodItem'
import { ISelectOption } from 'app/types/common'

interface EditFoodItemFormProps {
  initialData?: Partial<IFoodItem>
  onSuccess?: () => void
  onCancel?: () => void
  categories: ISelectOption[]
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
    short_description: initialData?.short_description || '',
    description: initialData?.description || '',
    price: initialData?.price ?? 0,
    category: (initialData?.category as unknown as string[]) || [],
    veg: initialData?.veg ?? true,
    available: initialData?.available ?? true,
    url: initialData?.url || '',
    public_id: initialData?.public_id ?? '',
    isImageUpdated: false,
    isEcoFriendlyContainer: initialData?.isEcoFriendlyContainer ?? false,
    hasSpiceLevel: initialData?.hasSpiceLevel ?? false,
    portions: initialData?.portions || [],
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

  const addPortion = () => {
    // Only add new portion if the last one is not empty
    if (form.portions.length === 0 || form.portions[form.portions.length - 1].trim() !== '') {
      setForm(prev => ({
        ...prev,
        portions: [...prev.portions, '']
      }))
    }
  }

  const updatePortion = (index: number, value: string) => {
    const newPortions = [...form.portions]
    newPortions[index] = value
    setForm(prev => ({
      ...prev,
      portions: newPortions
    }))
  }

  const removePortion = (index: number) => {
    const newPortions = form.portions.filter((_, i) => i !== index)
    setForm(prev => ({
      ...prev,
      portions: newPortions
    }))
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
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={{ width: 500, maxHeight: 600 }}>
      <form onSubmit={handleSubmit}>
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
          <Label>Short Description</Label>
          <Input
            placeholder="Short description (e.g., A perfect balance of taste, aroma, and warmth.)"
            value={form.short_description}
            onChangeText={(short_description) => setForm((f) => ({ ...f, short_description }))}
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
        
        {/* New Fields */}
        <XStack gap={'$10'}>
          <XStack items={'center'} gap={4} mt={'$4'}>
            <Text>{form.isEcoFriendlyContainer ? 'Eco-Friendly Container: Yes' : 'Eco-Friendly Container: No'}</Text>
            <Switch
              size="$4"
              checked={form.isEcoFriendlyContainer}
              onCheckedChange={(isEcoFriendlyContainer) => setForm((f) => ({ ...f, isEcoFriendlyContainer }))}
              bg={form.isEcoFriendlyContainer ? '#4caf50' : 'red'}
            >
              <Switch.Thumb animation="quick" bg={form.isEcoFriendlyContainer ? 'white' : '#f5f5f5'} />
            </Switch>
          </XStack>
          <XStack items={'center'} gap={4} mt={'$4'}>
            <Text>{form.hasSpiceLevel ? 'Spice Level: Yes' : 'Spice Level: No'}</Text>
            <Switch
              size="$4"
              checked={form.hasSpiceLevel}
              onCheckedChange={(hasSpiceLevel) => setForm((f) => ({ ...f, hasSpiceLevel }))}
              bg={form.hasSpiceLevel ? '#4caf50' : 'red'}
            >
              <Switch.Thumb animation="quick" bg={form.hasSpiceLevel ? 'white' : '#f5f5f5'} />
            </Switch>
          </XStack>
        </XStack>

        {/* Portions Section */}
        <YStack>
          <Label>Portions Available</Label>
          <YStack gap={8}>
            {form.portions.map((portion, index) => (
              <XStack key={index} gap={8} ai="center">
                <Input
                  placeholder="e.g., 100g, 200g, 1 plate"
                  value={portion}
                  onChangeText={(value) => updatePortion(index, value)}
                  style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF', flex: 1 }}
                />
                <Button
                  type="button"
                  size="$3"
                  theme="red"
                  onPress={() => removePortion(index)}
                  style={{ backgroundColor: '#ff4444', color: 'white' }}
                >
                  Remove
                </Button>
              </XStack>
            ))}
            <Button
              type="button"
              size="$3"
              theme="accent"
              onPress={addPortion}
              style={{ backgroundColor: '#4F8CFF', color: 'white', alignSelf: 'flex-start' }}
            >
              Add Portion
            </Button>
          </YStack>
        </YStack>

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
    </ScrollView>
  )
}
