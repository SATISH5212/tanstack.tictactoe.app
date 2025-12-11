import { useUserDetails } from "@/lib/helpers/userpermission";
import { FC } from "react";

const MotorControlButton: FC<any> = ({ motor, selectedMotors, handleMotorControlToggle }) => {
    const { isSupervisor, isAdmin } = useUserDetails();
    const isOn = (selectedMotors.get(motor.id)?.newState ?? motor.state) === 1;

    const isInactive = motor?.starterBox?.status === "INACTIVE";
    const isUnconfigured = motor?.starter_id == null;
    const hasFault = motor?.starterBoxParameters[0]?.fault_code !== 0;
    const noPower = motor?.starterBoxParameters[0]?.power_present !== "1";
    const notRemoteManual = motor.mode !== "REMOTE + MANUAL";


    const isDisabled = isInactive || isSupervisor() || isUnconfigured || hasFault || noPower || notRemoteManual || isAdmin();

    const titleText = isInactive
        ? "This device is currently inactive."
        : isUnconfigured
            ? "This motor is not connected to any device."
            : hasFault
                ? "A fault has been detected on this motor."
                : noPower
                    ? "Power is not available for this device."
                    : notRemoteManual
                        ? "Motor must be in Remote + Manual mode to control."
                        : (isSupervisor() || isAdmin()) ? "You are not allowed to change the motor state" : ""

    const bgColor = isDisabled
        ? isOn
            ? "bg-green-500 opacity-70"
            : "bg-red-400 opacity-70"
        : isOn
            ? "bg-green-600"
            : "bg-red-500";

    const cursorClass = isDisabled ? "cursor-not-allowed" : "cursor-pointer";

    return (
        <div className="w-full flex flex-row items-center   justify-end pr-5 ">
            <button
                onClick={() => !isDisabled && handleMotorControlToggle(motor, isOn ? 0 : 1)}
                disabled={isDisabled}
                title={titleText}
                className={`relative flex items-center w-12 h-5 rounded-full transition-all duration-300 shadow-sm ${bgColor} ${cursorClass}`}
            >
                <span
                    className={`absolute flex  w-[21px] h-[21px]  rounded-full shadow 
            transform transition-transform duration-300
            ${isOn ? "translate-x-7 bg-green-100" : "translate-x-0 bg-red-100"}
          `}
                />

                {/* <span
                    className={` absolute inset-0 flex items-center text-white text-[10px] tracking-tight
            ${isOn ? "justify-start pl-1.5" : "justify-end pr-1.5"}          `}
                >
                    {isOn ? "ON" : "OFF"}
                </span> */}
            </button>
        </div>
    );
};

export default MotorControlButton;
