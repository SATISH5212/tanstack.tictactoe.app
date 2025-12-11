import MotorFaultsIcon from "@/components/svg/map/MotorFaultsIcon";
import MotorOff from "@/components/svg/map/MotorOff";
import { Motor, MotorAddData } from "@/lib/interfaces/maps/ponds";

export const motorMakerIcon = (motor: Motor) => {
  if (motor?.faults?.fault_code && motor.faults.fault_code !== 0) {
    return <MotorFaultsIcon className="h-8 w-8" />;
  }
  if (motor?.state === 0) {
    return <MotorOff size={28} />;
  }
  return <img src="/assets/MotorRunning.svg" alt="Motor running" className="size-8" />;
};