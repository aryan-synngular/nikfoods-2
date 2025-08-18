import {useScreen} from "app/hook/useScreen"
import { Dialog, Sheet } from "tamagui"
import UpdateItem from "../profile/components/UpdateItem"
import OrderDetails from "../profile/components/OrderDetails"
export default function OrderDetailsPopup({detailsDialogOpen,detailsLoading,setDetailsDialogOpen,handleCloseDetails,selectedOrder}){
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
                 width: 400,
                 maxWidth: '100vw',
                 maxHeight: '90vh',
                 overflow: 'hidden',
               }}
             >
               {selectedOrder && (
                 <OrderDetails
                   order={selectedOrder}
                   onClose={handleCloseDetails}
                   loading={detailsLoading}
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
          backgroundColor="rgba(0,0,0,0.5)"
        />
        <Sheet.Handle backgroundColor="#E0E0E0" />
        <Sheet.Frame
          backgroundColor="white"
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          flex={1}
          mb={20}
          >
            {selectedOrder && (
                          <OrderDetails
                            order={selectedOrder}
                            onClose={handleCloseDetails}
                            loading={detailsLoading}
                          />
                        )}
        
        </Sheet.Frame>
      </Sheet>
)



}