// import * as Dialog from "@radix-ui/react-dialog";
// import { cn } from "@/lib/utils";
// import { X } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface CustomDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   title: string;
//   children: React.ReactNode;
// }

// const CustomDialog: React.FC<CustomDialogProps> = ({
//   open,
//   onOpenChange,
//   title,
//   children,
// }) => {
//   return (
//     <Dialog.Root open={open} onOpenChange={onOpenChange}>
//       <Dialog.Portal>
//         <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
//         <Dialog.Content
//           className={cn(
//             "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
//             "max-h-[85vh] overflow-y-auto"
//           )}
//         >
//           <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
//           <Dialog.Close asChild>
//             <Button
//               variant="ghost"
//               className="absolute right-4 top-4 h-6 w-6 p-0"
//               aria-label="Đóng"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </Dialog.Close>
//           <div className="mt-2">{children}</div>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog.Root>
//   );
// };

// export default CustomDialog;
