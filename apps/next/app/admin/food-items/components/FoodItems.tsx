'use client'
import { useCallback, useEffect, useState } from 'react';
import { YStack, XStack, Input, Select, Text, Switch, ScrollView, Button, Dialog, AlertDialog, Image, Circle, Square } from 'tamagui';
import { ArrowLeft, ArrowRight, Pencil, Plus, Trash } from '@tamagui/lucide-icons';
import EditFoodItemForm from './EditFoodItemForm';
import SelectableFoodCategory from './SelectableFoodCategory';


export default function FoodItems() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItemId, setDeleteItemId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(null);



  const [items, setItems] = useState<any>({items:[],total:0,page:1,pageSize:2});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(10);
const limit=7;
  const getFoodItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/food-item?search=${search}&category=${selectedCategory}&page=${page}&limit=${limit}`);
      const data = await response.json();
      console.log(data)
      setItems(data);
    } catch (error) {
      setError('Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  }, [search,selectedCategory,page]);


  useEffect(() => {
    getFoodItems()
  }, [getFoodItems]);
console.log(deleteItemId)

  const deleteFoodItem=useCallback(async()=>{
    try {
      if(!deleteItemId) return;
      setLoading(true);
      const response = await fetch(`/api/food-item?id=${deleteItemId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      console.log(data)
      await getFoodItems();

    } catch (error) {
      setError('Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  },[deleteItemId])

  return (
    <YStack space="$5" p="$4">
                  <Text fontWeight="bold" fontSize={20} >Food Items</Text>
      
      <XStack items="center" justify="space-between" mb="$3" gap={16}>
        <XStack items="center"  gap={32}>
        <Input
          placeholder="Search food items..."
          value={search}
          onChangeText={(v)=>{setSearch(v); getFoodItems()}}
          width={360}
          borderColor="#4F8CFF"
          bg="#F6FAFF"
        />
        
          
          <SelectableFoodCategory value={selectedCategory} onValueChange={(category)=>{setSelectedCategory(category); getFoodItems()}}></SelectableFoodCategory>
        </XStack>
                <Button size="$3"  color="white" hoverStyle={{bg:"#4F8CFF"}}  bg={"#4F8CFF"} p={12}  icon={Plus} onPress={() => { setEditDialogOpen(true); setEditItem(null) }}>Add Food Item</Button>

      </XStack> 
      {/* <ScrollView  horizontal height={"75vh"}  > */}
        <YStack  minW={1490} bg="#fff" height={"64vh"}  style={{
          overflow:"auto"
        }}  borderRadius={12} shadowColor="#4F8CFF22" shadowOpacity={0.08}>
          {/* Table Header */}
          <XStack bg="#E6F0FF" p={12} justify={"space-between"}  borderTopLeftRadius={12} borderTopRightRadius={12}>
            <Text width={80} fontWeight="700" color="#4F8CFF">Image</Text>
            <Text width={180} fontWeight="700" color="#4F8CFF">Name</Text>
            <Text width={250} fontWeight="700" color="#4F8CFF">Description</Text>
            <Text width={100} fontWeight="700" color="#4F8CFF">Price (₹)</Text>
            <Text width={120} fontWeight="700" color="#4F8CFF">Category</Text>
            <Text width={120} fontWeight="700" color="#4F8CFF">Veg/Non-Veg</Text>
            <Text width={140} fontWeight="700" color="#4F8CFF">Available</Text>
            <Text width={180} fontWeight="700" color="#4F8CFF">Actions</Text>
          </XStack>
          {/* Table Body */}
          {items?.items?.map((item, idx) => (
            <XStack  justify={"space-between"} key={idx} p={12} bg={idx % 2 === 0 ? '#F6FAFF' : '#FFF'} alignItems="center" borderBottomWidth={1} borderColor="#F0F0F0">
              <XStack style={{  
                borderRadius:"40px",
                overflow:"hidden",
                width:80,
                height:80
              }}  >
                

              
              <Image
                          source={{ uri: 'https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwZXRpemVyc3xlbnwwfHwwfHx8MA%3D%3D' }}
                          alt="nikfoods logo"
                          width={"100%"}
                          height={"100%"}
                          
                          resizeMode="contain" 
                          />
                          </XStack>
              <Text width={180} fontWeight="600">{item.name}</Text>
              <Text width={250} color="#555">{item.description}</Text>
              <Text width={100} color="#222">₹{item.price}</Text>
              <Text width={120} color="#FFB84F" fontWeight="700">{item.category}</Text>
              <Text width={120} fontWeight="700" color={item.veg ? '#00B894' : '#FF7675'}>
                {item.veg ? 'Veg' : 'Non-Veg'}
              </Text>
              <XStack width={140} items="center" gap={4}>
                <Switch checked={item.available} disabled size="$2" backgroundColor={item.available ? '#5FD068' : '#FF7675'} />
                <Text color={item.available ? '#5FD068' : '#FF7675'} fontWeight="700">
                  {item.available ? 'Available' : 'Unavailable'}
                </Text>
              </XStack>
               <XStack width={180} items="center" gap={4}>
                <Button size="$2" chromeless icon={Pencil} onPress={() => { setEditItem(item); setEditDialogOpen(true); }}>Edit</Button>
                <Button size="$2" chromeless icon={Trash} onPress={() => { setDeleteItemId(item?._id) ; setDeleteDialogOpen(true);}}>Delete</Button>
              </XStack>
            </XStack>
          ))}
        </YStack>
      {/* </ScrollView> */}

      {/* Page Navigation */}
 <XStack justify="flex-end" items={"center"} mt="$4" gap="$3">
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowLeft}
          disabled={page === 1 || loading}
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
        </Button>
        <Text fontWeight="700" color="#4F8CFF" items="center">
          Page {page} of {Math.ceil(items?.total / Number(limit))}
        </Text>
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowRight}
          disabled={page>=Math.ceil(items?.total / Number(limit)) || loading}
          onPress={() => setPage((prev) => prev + 1)}
        >
        </Button>
      </XStack>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content style={{ background: '#fff', borderRadius: 12, padding: 24, width: 540, maxWidth: '90vw' }}>
            <EditFoodItemForm
              initialData={editItem}
              onSuccess={() => { setEditDialogOpen(false); getFoodItems(); }}
              onCancel={() => setEditDialogOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <AlertDialog.Content style={{ background: '#fff', borderRadius: 12, padding: 24, width: 440, maxWidth: '90vw' }}>
            <AlertDialog.Description mb={"$4"}>Are you sure you want to delete this food item?</AlertDialog.Description>
           <XStack gap="$3" justify="flex-end">
              <AlertDialog.Cancel asChild>
                <Button>Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button onPress={() => { setDeleteDialogOpen(false); deleteFoodItem(); }} theme="accent">Accept</Button>
              </AlertDialog.Action>
            </XStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </YStack>
  );
}
