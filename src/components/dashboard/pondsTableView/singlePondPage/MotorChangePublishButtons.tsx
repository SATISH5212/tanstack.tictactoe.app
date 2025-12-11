import { Button } from "@/components/ui/button";
import { FC } from "react";

import SettingsIcon from "@/components/icons/devices/SettingsIcon";
import { Power } from "lucide-react";

const MotorChangePublishButtons: FC<any> = ({
  selectedMotors,
  setShowMotorChangeConfirmDialog,
  selectedMotorModes,
  setShowModeConfirmDialog,
}) => {
  return (
    <div className="ml-auto flex items-center gap-2">
      {selectedMotors.size > 0 && (
        <Button
          onClick={() => setShowMotorChangeConfirmDialog(true)}
          className="
            flex items-center gap-1.5 h-8 
            bg-white border-2 border-green-400 hover:bg-white 
            text-gray-700 text-xs 
            rounded-lg px-3 shadow-sm transition-all duration-150
          "
        >
          <Power className="w-4 h-4" />
          <span>Switch State</span>

          <span className="text-[10px] text-white  bg-green-500 px-2 py-[1px] rounded-full">
            {selectedMotors.size}
          </span>
        </Button>
      )}

      {selectedMotorModes.size > 0 && (
        <Button
          onClick={() => setShowModeConfirmDialog(true)}
          className="
            flex items-center gap-1.5 h-8 
          bg-white hover:bg-white border-2 border-green-400 text-gray-700 text-xs font-normal 
            rounded-lg px-3 shadow-sm transition-all duration-150
          "
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Switch Control Mode</span>

          <span className="text-[10px]  bg-green-500 px-2 py-[1px] rounded-full text-white ">
            {selectedMotorModes.size}
          </span>
        </Button>
      )}
    </div>
  );
};

export default MotorChangePublishButtons;
