import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "../ui/alert-dialog";
import DeleteAnimated from "../svg/animationIcons/DeleteAnimated";

const DeleteDialog = ({
  openOrNot,
  label,
  onCancelClick,
  onOKClick,
  deleteLoading,
  buttonLable,
  buttonLabling,
}: {
  openOrNot: boolean;
  label: string;
  onCancelClick: () => void;
  onOKClick: () => void;
  deleteLoading: boolean;
  buttonLable?: string;
  buttonLabling?: string;
}) => {
  return (
    <AlertDialog open={openOrNot}>
      <AlertDialogContent
        className="
          bg-white dark:bg-[#121212]
          max-w-md w-[80%]
          rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
          animate-in fade-in zoom-in duration-200
        "
      >
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 ">
            <div
              className="
      flex items-center justify-center
      w-20 h-20 rounded-full border-2 border-green-300
      bg-red-50 dark:bg-red-900/30
    "
            >
              <DeleteAnimated size={78} />
            </div>
            <div className="flex flex-col  h-full py-2">

              <AlertDialogTitle
                className="
                text-lg font-semibold text-gray-900 dark:text-gray-100
              "
              >
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription
                className="
              text-sm text-gray-600 dark:text-gray-400 ml-1
              leading-relaxed
            " 
              >
                {label}
              </AlertDialogDescription>
            </div>

          </div>

        </AlertDialogHeader>

        <AlertDialogFooter className=" flex justify-end gap-2">
          <AlertDialogCancel
            onClick={onCancelClick}
            className="
              px-2 py-1 rounded-md 
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-transparent
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all duration-150
            "
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onOKClick}
            className="
              px-2 py-1 rounded-md
              bg-red-600 dark:bg-red-700
              text-white font-medium
              hover:bg-red-700 dark:hover:bg-red-800
              transition-all duration-150
              flex items-center gap-2
            "
          >
            {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}

            {deleteLoading
              ? buttonLabling || "Deleting..."
              : buttonLable || "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
