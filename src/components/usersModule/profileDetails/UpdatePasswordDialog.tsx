import { PasswordSvg } from "@/components/svg/PasswordSvg";
import { EditPasswordDialogProps } from "@/lib/interfaces/users";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
const UpdatePasswordDialog: React.FC<EditPasswordDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isPending,
  errorMessage,
  setErrorMessage,
  updatePassword,
  setUpdatePassword,
}) => {
  if (!isOpen) return null;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(updatePassword.trim());
  };

  const handleClose = () => {
    setErrorMessage(null);
    setUpdatePassword("");
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            Update Password <span className="text-red-500">*</span>
          </h2>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center w-full rounded-lg border pl-2 bg-f9f9f9 mt-3">
            <PasswordSvg />
            <input
              ref={inputRef}
              placeholder="Enter your Password"
              className="h-full outline-none p-2 w-full bg-inherit font-light"
              type={"text"}
              value={updatePassword}
              onChange={(e) => {
                setUpdatePassword(e.target.value);
                setErrorMessage(null);
              }}
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
          )}
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-lg text-gray-700 hover:bg-gray-200 text-sm font-medium border border-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${isPending
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
              }`}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              "Update"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordDialog;
