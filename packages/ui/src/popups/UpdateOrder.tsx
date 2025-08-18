import {useScreen} from "app/hook/useScreen"
import { Dialog, Sheet } from "tamagui"
import UpdateItem from "../profile/components/UpdateItem"
import { Text } from "tamagui"
export default function UpdateOrderPopup({updateItemDialogOpen,selectedOrderIdForUpdate,setUpdateItemDialogOpen,handleCloseUpdateItem,handleItemUpdate}){
const {isMobile,isMobileWeb}=useScreen()

if(!isMobile&&!isMobileWeb){

  return (
    <Dialog open={updateItemDialogOpen} onOpenChange={setUpdateItemDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content
            style={{
              background: 'transparent',
              padding: 0,
              width: 'auto',
              maxWidth: '100vw',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
            >
            {selectedOrderIdForUpdate && (
              <UpdateItem
              orderId={selectedOrderIdForUpdate}
              onClose={handleCloseUpdateItem}
              onUpdate={handleItemUpdate}
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
        open={updateItemDialogOpen}
        onOpenChange={setUpdateItemDialogOpen}
        snapPoints={[80]}
        dismissOnSnapToBottom
        zIndex={100_000}
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(0,0,0,0.5)"
        />
        <Sheet.Handle backgroundColor="#E0E0E0" />
        <Sheet.Frame
          backgroundColor="white"
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          flex={1}
          >
            {selectedOrderIdForUpdate && (
              <UpdateItem
              orderId={selectedOrderIdForUpdate}
              onClose={handleCloseUpdateItem}
              onUpdate={handleItemUpdate}
              />
            )}
        
        </Sheet.Frame>
      </Sheet>
)



}