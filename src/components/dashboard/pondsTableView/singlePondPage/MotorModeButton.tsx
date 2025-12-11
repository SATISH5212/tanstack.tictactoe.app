import { captalizeLocation } from "@/lib/helpers/capitalize";
import { getModeNumber } from "@/lib/helpers/map/mqttHelpers/motorModeConversion";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { MotorModeProps } from "@/lib/interfaces/maps/ponds";
import React from "react";

const MotorModeButton: React.FC<MotorModeProps> = ({
  motor,
  selectedMotorModes,
  onModeChange,
}) => {
  const currentMode =
    selectedMotorModes.get(motor.id)?.newMode ?? getModeNumber(motor.mode);

  const [location] = motor.mode.split("+").map((s) => s.trim());

  const isRemote = location === "REMOTE";

  function getControlFromMode(modeNum: number): string {
    return [1, 3].includes(modeNum) ? "AUTO" : "MANUAL";
  }

  const handleModeChange = (controlType: "MANUAL" | "AUTO") => {
    let newModeNumber: number;

    if (location === "LOCAL") {
      newModeNumber = controlType === "MANUAL" ? 0 : 1;
    } else {
      newModeNumber = controlType === "MANUAL" ? 2 : 3;
    }

    if (newModeNumber !== currentMode) {
      onModeChange(motor, newModeNumber);
    }
  };

  const currentControl = getControlFromMode(currentMode);
  const { isSupervisor, isAdmin } = useUserDetails();

  const isDeviceInactive = motor?.starterBox?.status === "INACTIVE";
  const isDeviceUnconfigured = motor?.starter_id == null;
  const isNotRemoteControl = !isRemote;
  const isDisabled = isDeviceInactive || isDeviceUnconfigured || isNotRemoteControl || isSupervisor() || isAdmin();

  const cursorClass = isDisabled ? "cursor-not-allowed" : "cursor-pointer";

  const titleText = isDeviceInactive
    ? "This device is currently inactive."
    : isDeviceUnconfigured
      ? "This motor is not connected to any device."
      : isNotRemoteControl
        ? "Remote mode is required to change motor control."
        : (isSupervisor() || isAdmin())
          ? "You are not allowed to change the motor state"
          : "Change the motor's operating mode.";

  return (
    <div className="flex flex-row">
      <div className="flex items-center gap-2 pl-4">
        <span className=" text-black capitalize">
          {captalizeLocation(location) || "--"}
        </span>

        <span
          className={`flex flex-row items-center rounded-md gap-1 bg-white px-1.5 py-1 ${cursorClass}`}
        >
          {["MANUAL", "AUTO"].map((controlMode) => {
            const isActive = currentControl === controlMode;
            const isAuto = controlMode === "AUTO";
            const isManual = controlMode === "MANUAL";

            const baseStyle =
              "h-7 min-w-[58px] flex justify-center items-center text-xs font-normal rounded-md transition-all duration-150";

            const activeStyle = isDisabled
              ? `${isAuto ? "bg-orange-300" : "bg-blue-300"} text-white opacity-80`
              : `${isAuto ? "bg-orange-500" : "bg-blue-500"} text-white`;

            const inactiveStyle = isDisabled
              ? "text-gray-800 opacity-80"
              : "text-gray-800 hover:bg-gray-200";

            return (
              <button
                key={controlMode}
                className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle} ${cursorClass}`}
                disabled={isDisabled}
                title={titleText}
                onClick={() =>
                  !isDisabled &&
                  handleModeChange(controlMode as "MANUAL" | "AUTO")
                }
              >
                {controlMode.charAt(0) + controlMode.slice(1).toLowerCase()}
              </button>
            );
          })}

        </span>
      </div>
    </div>
  );
};

export default MotorModeButton;
