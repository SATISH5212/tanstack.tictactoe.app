import { Button } from "@/components/ui/button";
import { getModeString } from "@/lib/helpers/map/mqttHelpers/motorModeConversion";
import { MotorChangeConfirmDialogProps } from "@/lib/interfaces/maps/ponds";

const MotorChangeConfirmDialog = ({
    isOpen,
    type,
    changes,
    onCancel,
    onConfirm,
}: MotorChangeConfirmDialogProps) => {
    if (!isOpen) return null;

    const isStateChange = type === "state";
    const changeArray = Array.from(changes.values());

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50">
            <div
                className={`
          bg-white rounded-xl shadow-lg px-5 py-4 
          ${isStateChange ? "w-[340px]" : "w-[400px]"}
        `}
            >
                <h3 className="text-lg font-medium tracking-tighter text-gray-900 mb-2">
                    {isStateChange
                        ? "Confirm Motor State Update"
                        : "Confirm Control Mode Update"}
                </h3>

                <div className="max-h-56 overflow-y-auto pr-1">
                    <ul
                        className={`
              text-sm text-gray-700 mb-2 
              divide-y divide-gray-200 
            `}
                    >
                        {changeArray.map((motor) => (
                            <li
                                key={motor.id}
                                className="flex justify-between items-center p-1 hover:bg-gray-50 rounded"
                            >
                                <span className="font-medium capitalize">{motor.title}</span>

                                <span
                                    className={`                    font-normal tracking-tighter 
              
                  `}
                                >
                                    {isStateChange
                                        ? motor.newState === 1
                                            ? "ON"
                                            : "OFF"
                                        : getModeString(motor.newMode!)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>


                <div className="flex justify-end items-center gap-2">
                    <Button
                        variant="outline"
                        className="px-3 h-full text-sm border border-gray-200 text-gray-700 hover:bg-gray-100 "
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>

                    <Button
                        className={`
              px-2 h-full    text-sm font-normal text-white  bg-green-600 hover:bg-green-700           `}
                        onClick={() => onConfirm(changeArray)}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MotorChangeConfirmDialog;
