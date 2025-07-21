'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertDialog, Button, Dialog, Text, XStack, YStack } from 'tamagui'
import EditCategoryForm from './EditFoodCategory'
import { Plus } from '@tamagui/lucide-icons'
import { CategoryCard } from './CategoryCard'

export default function FoodCategory() {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [editItem, setEditItem] = useState<any>(null)
  const [deleteItemId, setDeleteItemId] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(null)

  const [categories, setCategories] = useState<any>({ items: [], total: 0, page: 1, pageSize: 2 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/food-category`)
      const data = await response.json()
      console.log(data)
      setCategories(data)
    } catch (error) {
      setError('Failed to fetch food items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getCategories()
  }, [getCategories])
  console.log(deleteItemId)

  const deleteCategory = useCallback(async () => {
    try {
      if (!deleteItemId) return
      setLoading(true)
      const response = await fetch(`/api/food-category?id=${deleteItemId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      console.log(data)
      await getCategories()
    } catch (error) {
      setError('Failed to fetch food items')
    } finally {
      setLoading(false)
    }
  }, [deleteItemId])

  return (
    <YStack space="$5" p="$4">
      <XStack items="center" justify="space-between" mb="$3" gap={16}>
        <XStack items="center" gap={32}>
          <Text fontWeight="bold" fontSize={20}>
            Food Category
          </Text>
        </XStack>
        <Button
          size="$3"
          color="white"
          hoverStyle={{ bg: '#4F8CFF' }}
          bg={'#4F8CFF'}
          p={12}
          icon={Plus}
          onPress={() => {
            setEditDialogOpen(true)
            setEditItem(null)
          }}
        >
          Add Food Category
        </Button>
      </XStack>

      <XStack gap="$12" flexWrap="wrap" style={{ paddingTop: 20, paddingBottom: 20 }}>
        {categories.items.map((category) => (
          <CategoryCard
            handleEdit={() => {
              ;(setEditItem(category), setEditDialogOpen(true))
            }}
            handleDelete={() => {
              setDeleteItemId(category._id)
              setDeleteDialogOpen(true)
            }}
            key={category.id}
            imageUrl={category.url}
            name={category.name}
            id={category._id}
          />
        ))}
      </XStack>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              width: 540,
              maxWidth: '90vw',
            }}
          >
            <EditCategoryForm
              initialData={editItem}
              onSuccess={() => {
                setEditDialogOpen(false)
                getCategories()
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <AlertDialog.Content
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              width: 440,
              maxWidth: '90vw',
            }}
          >
            <AlertDialog.Description mb={'$4'}>
              Are you sure you want to delete this category?
            </AlertDialog.Description>
            <XStack gap="$3" justify="flex-end">
              <AlertDialog.Cancel asChild>
                <Button>Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  onPress={() => {
                    setDeleteDialogOpen(false)
                    deleteCategory()
                  }}
                  theme="accent"
                >
                  Accept
                </Button>
              </AlertDialog.Action>
            </XStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </YStack>
  )
}
