import {useScreen} from "app/hook/useScreen"
import { Dialog, Sheet } from "tamagui"
import TrackOrder from "../profile/components/TrackOrder"
export default function TrackOrderPopup({trackOrderDialogOpen,selectedOrderIdForTracking,setTrackOrderDialogOpen,handleCloseTrackOrder,handleItemUpdate}){
const {isMobile,isMobileWeb}=useScreen()

if(!isMobile&&!isMobileWeb){

  return (
     <Dialog open={trackOrderDialogOpen} onOpenChange={setTrackOrderDialogOpen}>
           <Dialog.Portal>
             <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
             <Dialog.Content
               style={{
                 background: 'transparent',
                 padding: 0,
                 width: '90vw',
                 minWidth: 1000,
                 maxHeight: '90vh',
                 overflow: 'hidden',
               }}
             >
               {selectedOrderIdForTracking && (
                 <TrackOrder orderId={selectedOrderIdForTracking} onClose={handleCloseTrackOrder} />
               )}
             </Dialog.Content>
           </Dialog.Portal>
         </Dialog>
   

)

}


return (
    <Sheet
        modal
        open={trackOrderDialogOpen}
        onOpenChange={setTrackOrderDialogOpen}
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
            {selectedOrderIdForTracking && (
                             <TrackOrder orderId={selectedOrderIdForTracking} onClose={handleCloseTrackOrder} />

            )}
        
        </Sheet.Frame>
      </Sheet>
)



}