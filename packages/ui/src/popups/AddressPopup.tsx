import {useScreen} from "app/hook/useScreen"
import { Dialog, Sheet } from "tamagui"
import UpdateItem from "../profile/components/UpdateItem"
import { Text } from "tamagui"
import AddReview from "../profile/components/AddReview"
import { AddAddressForm } from "../profile/AddAddressForm"
export default function AddressPopup({editDialogOpen,editItem,setEditDialogOpen,onSuccess}){
const {isMobile,isMobileWeb}=useScreen()

if(!isMobile&&!isMobileWeb){

  return (
     <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
            <Dialog.Content
           
            >
                <AddAddressForm
                  initialData={editItem}
                  onSuccess={onSuccess}
                  onCancel={() => setEditDialogOpen(false)}
                />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
  

)

}

return (
    <Sheet
        modal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
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
        <AddAddressForm
                  initialData={editItem}
                  onSuccess={onSuccess}
                  onCancel={() => setEditDialogOpen(false)}
                />
        
        </Sheet.Frame>
      </Sheet>
)



}