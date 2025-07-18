import { useState } from 'react';
import { YStack, XStack, Input, Select, Text, Switch, Button, Spinner, TextArea } from 'tamagui';
import {  IFoodItem } from 'models/FoodItem';
import SelectableFoodCategory from './SelectableFoodCategory';
import UploadButton from './UploadButton';
import MultiSelectDropdown from './MutiSelect';

interface EditFoodItemFormProps {
  initialData?: Partial<IFoodItem>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditFoodItemForm({ initialData = {}, onSuccess, onCancel }: EditFoodItemFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || "All",
    veg: initialData?.veg ?? true,
    available: initialData?.available ?? true,
  });
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(false);

  function validate() {
    let err = '';
    if (!form.name.trim()) err += 'Name is required. ';
    if (typeof form.price !== 'number' || isNaN(form.price) || form.price < 0) err += 'Price must be a non-negative number. ';
    // if (!form.category || !FOODITEM_CATEGORY.includes(form.category)) err += 'Category is invalid. ';
    if (typeof form.veg !== 'boolean') err += 'Veg must be boolean. ';
    if (typeof form.available !== 'boolean') err += 'Available must be boolean. ';
    setErrors(err);
    return !err;
  }

  async function handleSubmit(e: React.FormEvent) {
    console.log(e)
    console.log(form)
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors('');

    try {
      let res;
      if (initialData?._id) {
         res = await fetch(`/api/food-item`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({...form, _id: initialData?._id}),
        });
      } else {
       res = await fetch('/api/food-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
            const data = await res?.json();
      if (!res?.ok) throw new Error(data?.error || 'Failed to save');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.log(err)
      setErrors(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: 500 }}>
      <YStack style={{ gap: 16 }}>

        <Text style={{ fontWeight: '700', fontSize: 20, marginBottom: 8 }}>{initialData?._id ? 'Edit' : 'Add'} Food Item</Text>
       <UploadButton></UploadButton>
        <Input
          placeholder="Name"
          value={form.name}
          onChangeText={name => setForm(f => ({ ...f, name }))}
          style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF' }}
        />
        <TextArea
          placeholder="Description"
          value={form.description}
          onChangeText={description => setForm(f => ({ ...f, description }))}
          style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF' }}
        />
        <Input
          placeholder="Price"
          value={form.price.toString()}
          keyboardType="numeric"
          onChangeText={v => setForm(f => ({ ...f, price: Number(v) }))}
          style={{ borderColor: '#4F8CFF', backgroundColor: '#F6FAFF' }}
        />
        <XStack style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ minWidth: 80 }}>Category:</Text>
         <SelectableFoodCategory value={form.category} onValueChange={category => setForm(f => ({ ...f, category }))}></SelectableFoodCategory> 
        </XStack>
        <XStack style={{ alignItems: 'center', gap: 16 }}>
          <Text>Veg:</Text>
          <Switch
            checked={form.veg}
            onCheckedChange={veg => setForm(f => ({ ...f, veg }))}
            style={{ backgroundColor: form.veg ? '#5FD068' : '#FF7675' }}
          />
          <Text>Available:</Text>
          <Switch
            checked={form.available}
            onCheckedChange={available => setForm(f => ({ ...f, available }))}
            style={{ backgroundColor: form.available ? '#5FD068' : '#FF7675' }}
          />
        </XStack>
        {errors && <Text style={{ color: 'red', marginBottom: 8 }}>{errors}</Text>}
        <XStack mt={"$4"} style={{ gap: 12 }}>
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
            variant='outlined'
            style={{  flex: 1 }}
          >
            Cancel
          </Button>
        </XStack>
      </YStack>
    </form>
  );
}
