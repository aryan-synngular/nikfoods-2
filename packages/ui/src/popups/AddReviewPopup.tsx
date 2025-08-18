import {useScreen} from "app/hook/useScreen"
import { Dialog, Sheet } from "tamagui"
import UpdateItem from "../profile/components/UpdateItem"
import { Text } from "tamagui"
import AddReview from "../profile/components/AddReview"
export default function AddReviewPopup({reviewDialogOpen,selectedOrderIdForReview,selectedOrderForReview,setReviewDialogOpen,handleReviewSubmit,handleCloseReview}){
const {isMobile,isMobileWeb}=useScreen()

if(!isMobile&&!isMobileWeb){

  return (
   <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
           <Dialog.Portal>
             <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
             <Dialog.Content
               style={{
                 background: 'transparent',
                 padding: 0,
                 width: 400,
                 maxWidth: '100vw',
                 maxHeight: '90vh',
                 overflow: 'hidden',
               }}
             >
               {selectedOrderIdForReview && selectedOrderForReview && (
                 <AddReview
                   orderId={selectedOrderIdForReview}
                   orderDetails={selectedOrderForReview} // Pass the complete order object
                   onClose={handleCloseReview}
                   onSubmit={handleReviewSubmit}
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
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
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
           {selectedOrderIdForReview && selectedOrderForReview && (
                 <AddReview
                   orderId={selectedOrderIdForReview}
                   orderDetails={selectedOrderForReview} // Pass the complete order object
                   onClose={handleCloseReview}
                   onSubmit={handleReviewSubmit}
                 />
               )}
        
        </Sheet.Frame>
      </Sheet>
)



}