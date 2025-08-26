import {useScreen} from "app/hook/useScreen"
import { Dialog, Sheet } from "tamagui"
import SingleFoodItemPage from "../food-item/SingleFoodItemPage"
export default function SingleFoodItemPopup({
  detailsDialogOpen,
  detailsLoading,
  setDetailsDialogOpen,
  handleCloseDetails,
  selectedFoodItem,
  isAddedToCart = false,
  cartItemId,
  currentQuantity = 0,
  onAddToCart
}){
const {isMobile,isMobileWeb}=useScreen()

if(!isMobile&&!isMobileWeb){

  return (
   <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
           <Dialog.Portal>
             <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
             <Dialog.Content
               style={{
                 background: '#fff',
                 padding: 0,
                 width: 800,
                 maxWidth: '100vw',
                 maxHeight: '90vh',
                 overflow: 'hidden',
               }}
             >
               {selectedFoodItem && (
                 <SingleFoodItemPage
                   foodItem={selectedFoodItem}
                   onClose={handleCloseDetails}
                   loading={detailsLoading}
                   isAddedToCart={isAddedToCart}
                   cartItemId={cartItemId}
                   currentQuantity={currentQuantity}
                   onAddToCart={onAddToCart}
                 />
               )}
             </Dialog.Content>
           </Dialog.Portal>
         </Dialog>

)

}


return (
    <Sheet
        modal
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        snapPoints={[80]}
        dismissOnSnapToBottom
        zIndex={100_000}
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          background="rgba(0,0,0,0.5)"
        />
        <Sheet.Handle background="#E0E0E0" />
        <Sheet.Frame
          background="white"
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          flex={1}
          mb={20}
          >
            {selectedFoodItem && (
                          <SingleFoodItemPage
                            foodItem={selectedFoodItem}
                            onClose={handleCloseDetails}
                            loading={detailsLoading}
                            isAddedToCart={isAddedToCart}
                            cartItemId={cartItemId}
                            currentQuantity={currentQuantity}
                            onAddToCart={onAddToCart}
                          />
                        )}
        
        </Sheet.Frame>
      </Sheet>
)



}