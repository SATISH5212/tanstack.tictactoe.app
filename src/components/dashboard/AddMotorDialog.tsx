import { AddMotorDialogProps } from "@/lib/interfaces/ponds";
import { Loader2, X } from "lucide-react";
import MotorPowerInput from "../core/motorPowerInput";

const AddMotorDialog: React.FC<AddMotorDialogProps> = (props) => {
  const {
    isOpen,
    onClose,
    onSave,
    isPending,
    motorErrorMessage,
    setMotorErrorMessage,
    motorName,
    setMotorName,
    motorHp,
    setMotorHp,
  } = props;

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(motorName.trim(), motorHp);
  };

  const handleClose = () => {
    setMotorErrorMessage(null);
    setMotorName("");
    setMotorHp("");
    onClose();
  };

  return (
    <div className="absolute right-10 inset-0 flex items-center justify-center z-50 pointer-events-none ">
      <div className="bg-white rounded-md p-4 w-64 shadow-md pointer-events-auto">
        <div className="flex  gap-2 mb-2 ">
          <div className="w-3/4 space-y-2 ">
            <label className="text-xs font-normal text-gray-900 mb-2">
              Motor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={motorName}
              onChange={(e) => {
                setMotorName(e.target.value);
                setMotorErrorMessage((prev: any) => ({ ...prev, title: "" }));
              }}
              className="w-full h-9 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs font-light capitalize"
              placeholder="Motor Name"
            />
            {motorErrorMessage?.title && (
              <p className="text-red-500 text-xs mt-1">
                {motorErrorMessage.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-normal text-gray-900 mb-2 ">
              Power(HP)<span className="text-red-500">*</span>
            </label>
            <MotorPowerInput
              motor={{ power: motorHp }}
              handleMotorPowerChange={(motorId, newPower) =>
                setMotorHp(newPower)
              }
              setMotorErrorMessage={setMotorErrorMessage}
            />
            {motorErrorMessage?.hp && (
              <p className="text-red-500 text-xs mt-1">
                {motorErrorMessage.hp}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-3">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 transition-colors rounded-md text-sm font-medium border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-1.5  rounded-md transition-colors flex items-center justify-center text-sm font-medium  ${
              isPending || parseFloat(motorHp) >= 30
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            disabled={isPending || parseFloat(motorHp) >= 30} 
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMotorDialog;
