import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { X, Minus, Plus } from '@tamagui/lucide-icons';
import { XStack, YStack, Button, Spinner } from 'tamagui';
import { useStore } from 'app/src/store/useStore';
import { useToast } from '../useToast';
import { colors } from '../colors';
import { useScreen } from 'app/hook/useScreen';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  url?: string; // Add url property for compatibility
  isVegetarian?: boolean;
  weight?: string;
}

interface SingleFoodItemPageProps {
  foodItem: FoodItem;
  onClose: () => void;
  loading?: boolean;
  isAddedToCart?: boolean; // Add prop to control quantity controls visibility
  cartItemId?: string; // Add cart item ID for quantity updates
  currentQuantity?: number; // Add current quantity in cart
  onAddToCart?: () => void; // Add handler for "Add to Cart" button
}

export default function SingleFoodItemPage({ 
  foodItem, 
  onClose, 
  loading, 
  isAddedToCart = false, 
  cartItemId, 
  currentQuantity = 0,
  onAddToCart
}: SingleFoodItemPageProps) {
  const [quantity, setQuantity] = useState(currentQuantity || 1);
  const { updateCartItemQuantity } = useStore();
  const { showMessage } = useToast();
  const { isMobile, isMobileWeb } = useScreen();
  const [isLoading, setIsLoading] = useState({ itemId: '', change: 0 });
  const handleQuantityChange = async (change: number) => {
    if (!cartItemId) return;
    
    setIsLoading({ itemId: cartItemId, change });
    try {
      await updateCartItemQuantity({ cartItemId, change });
      showMessage('Quantity Updated Successfully', 'success');
    } catch (error) {
      showMessage('Failed to update quantity', 'error');
    } finally {
      setIsLoading({ itemId: '', change: 0 });
    }
  };

  const handleAddToOrder = () => {
    // Handle add to order logic
    if (onAddToCart) {
      onAddToCart();
    } else {
      console.log(`Adding ${quantity} of ${foodItem.name} to order`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={20} color="#000" />
      </TouchableOpacity>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: foodItem?.url || foodItem?.image || 'https://via.placeholder.com/400x300?text=Paneer' }}
          style={{...styles.productImage, height:(isMobile || isMobileWeb )? "100%" : 700}}
          resizeMode="cover"
        />
      </View>

      {/* Product Information Overlay */}
      <View style={styles.infoOverlay}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <XStack
          justify="space-between"
          items="center"
          >

          {/* Product Title */}
          <Text style={styles.productTitle}>
            {foodItem.name }
          </Text>

          {/* Vegetarian Icon */}
          <View style={styles.vegetarianIcon}>
            <Text style={styles.vegetarianText}>VG</Text>
          </View>
          </XStack>

          {/* Product Description */}
          <Text 
            style={{
              color: "#666",
              fontSize: 16,
              marginBottom: 24,
              lineHeight: 22,
              flexWrap: 'wrap'
            }}
            numberOfLines={undefined}
          >
            {foodItem.description}
          </Text>

          {/* Bottom Controls */}
          {isAddedToCart && (
            <YStack
              mt={8}
              flexDirection="row"
              justify={'space-between'}
              style={{ alignItems: 'flex-end' }}
            >
              <XStack
                style={{
                  alignItems: 'center',
                  marginRight: isMobile || isMobileWeb ? 0 : 24,
                }}
              >
                <XStack style={{ alignItems: 'center' }}>
                  <Button
                    size={isMobile || isMobileWeb ? '$1' : '$2'}
                    circular
                    style={{
                      width: isMobile || isMobileWeb ? 20 : 24,
                      height: isMobile || isMobileWeb ? 20 : 24,
                      backgroundColor: '#f5f5f5',
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                    }}
                    onPress={() => handleQuantityChange(-1)}
                    disabled={isLoading?.itemId === cartItemId && isLoading?.change === -1}
                  >
                    {isLoading?.itemId === cartItemId && isLoading?.change === -1 ? (
                      <Spinner color={colors.primary} />
                    ) : (
                      <Minus size={12} color="#666" />
                    )}
                  </Button>
                  <Text
                    style={{
                      marginHorizontal: isMobile || isMobileWeb ? 8 : 12,
                      fontSize: isMobile || isMobileWeb ? 14 : 16,
                      fontWeight: '500',
                      minWidth: isMobile || isMobileWeb ? 16 : 20,
                      textAlign: 'center',
                    }}
                  >
                    {currentQuantity}
                  </Text>
                  <Button
                    size={isMobile || isMobileWeb ? '$1' : '$2'}
                    circular
                    style={{
                      width: isMobile || isMobileWeb ? 20 : 24,
                      height: isMobile || isMobileWeb ? 20 : 24,
                      backgroundColor: '#f5f5f5',
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                    }}
                    onPress={() => handleQuantityChange(1)}
                    disabled={isLoading?.itemId === cartItemId && isLoading?.change === 1}
                  >
                    {isLoading?.itemId === cartItemId && isLoading?.change === 1 ? (
                      <Spinner color={colors.primary} />
                    ) : (
                      <Plus size={12} color="#666" />
                    )}
                  </Button>
                </XStack>
              </XStack>

              {/* Price */}
              <Text
                style={{
                  fontSize: isMobile || isMobileWeb ? 16 : 18,
                  fontWeight: '700',
                  color: '#000000',
                  minWidth: 80,
                  textAlign: 'right',
                }}
              >
                ${foodItem.price.toFixed(2)}
              </Text>
            </YStack>
          )}


          {/* Add to Order Button - Only show if not added to cart */}
          {!isAddedToCart && (
            <XStack justify="flex-end" items="center" mb={isMobile || isMobileWeb ? 10 : 0} >

            <Button size={isMobile || isMobileWeb ? "$4" : "$3"}  onPress={handleAddToOrder} style={{backgroundColor:colors.primary,color:"#fff",borderRadius:10,padding:10}}>
              <Text  style={{fontSize:isMobile || isMobileWeb ? 16 : 16,fontWeight:"bold", color:"white"}}>
                Add to Cart 
              </Text>
            </Button>
            </XStack>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width:  "100%",
    // height: "100%",
    borderRadius: 12,
    resizeMode: 'cover',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: '60%', // Allow overlay to take up to 60% of screen height
    minHeight: 200, // Ensure minimum height for content
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  vegetarianIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  vegetarianText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  addToOrderButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 16,
  },
  addToOrderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 