import UploadImageButton from 'app/admin/food-items/components/UploadButton';
import { useState } from 'react';
import { YStack, XStack, Input, Text, Button, Spinner, TextArea } from 'tamagui';

interface CategoryFormProps {
  initialData?: Partial<ICategory>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface ICategory {
  _id?: string;
  name: string;
  description?: string;
}

export default function EditCategoryForm({ initialData = {}, onSuccess, onCancel }: CategoryFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(false);

  function validate() {
    let err = '';
    if (!form.name.trim()) err += 'Name is required. ';
    setErrors(err);
    return !err;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors('');

    try {
      let res;
      if (initialData?._id) {
        res = await fetch(`/api/food-category`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, _id: initialData._id }),
        });
      } else {
        res = await fetch('/api/food-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrors(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: 500 }}>
      <YStack style={{ gap: 16 }}>
        <Text style={{ fontWeight: '700', fontSize: 20, marginBottom: 8 }}>
          {initialData?._id ? 'Edit' : 'Add'} Category
        </Text>
        <UploadImageButton></UploadImageButton>
        <Input
          placeholder="Category Name"
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

        {errors && <Text style={{ color: 'red', marginBottom: 8 }}>{errors}</Text>}

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
  );
}
