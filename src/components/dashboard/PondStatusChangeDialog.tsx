import { PondStatusChangeDialogProps } from "@/lib/interfaces/maps/ponds";
import { Loader2 } from "lucide-react";
import PondStatusAnimated from "../svg/animationIcons/PondStatusChange";
const PondStatusChangeDialog = ({
  isOpen,
  type,
  isPending,
  changes,
  onCancel,
  onConfirm,
  pondStatus,
}: PondStatusChangeDialogProps) => {
  if (!isOpen) return null;

  const pondList = Array.from(changes.values());

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-white w-full max-w-md rounded-xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <PondStatusAnimated
            size={70}
            isActivating={pondStatus !== "ACTIVE"}
          />
          <h2 className="text-lg font-bold">
            {type === "pondStatus"
              ? "Change Pond Status"
              : "Change Device Status"}
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          The following ponds will be{" "}
          {pondStatus === "ACTIVE" ? "deactivated" : "activated"}:
        </p>

        <div className="rounded-lg p-2 mb-4">
          <ul className="space-y-2 text-sm max-h-[150px] overflow-auto">
            {pondList.map((title, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <svg
                  className={`w-3.5 h-3.5 ${
                    pondStatus === "ACTIVE" ? "text-red-500" : "text-green-500"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                </svg>
                {title}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(changes)}
            disabled={isPending}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
              pondStatus === "ACTIVE"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } disabled:opacity-50`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PondStatusChangeDialog;
