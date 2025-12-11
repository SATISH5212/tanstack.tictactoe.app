import DeleteDialog from "@/components/core/DeleteDialog";
import DeviceNodeIcon from "@/components/icons/device/DeviceNodeIcon";
import RemoveDeviceIcon from "@/components/icons/device/RemoveDevice";
import ReplaceDeviceIcon from "@/components/icons/device/ReplaceDevice";
import { PowerOn } from "@/components/icons/stats/PowerOn";
import AlertIcon from "@/components/svg/AlertsIcon";
import { DeleteDeviceIcon } from "@/components/svg/DeletePond";
import { GreenDot } from "@/components/svg/GreenDot";
import DeviceConfigIcon from "@/components/svg/map/DeviceConfigIcon";
import { MeterIcon } from "@/components/svg/MeterIcon";
import { MotorSvg } from "@/components/svg/MotorSvg";
import { RedDot } from "@/components/svg/RedDot";
import VoltsIcon from "@/components/svg/VoltsIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import formatValue from "@/lib/helpers/formatVoltCur";
import { getFaultDescription } from "@/lib/helpers/motorFaultCodes";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { IMotorCardProps } from "@/lib/interfaces/maps/ponds";
import { MoreVertical } from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";
import MotorControlButton from "./MotorControlButton";
import MotorModeButton from "./MotorModeButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MotorCard: FC<IMotorCardProps> = (props) => {
  const {
    motor,
    openMotorId,
    setOpenMotorId,
    openDropdownMotorId,
    isReplaceMode,
    selectedMotors,
    selectedMotorModes,
    handleMotorControlToggle,
    handleMotorModeToggle,
    handleReplaceClick,
    handleRemoveDeviceClick,
    handleConfigClick,
    deviceSelectionDropdown,
    dropdownRef,
    replaceDropdownRef,
    isOwner,
    isManager,
    deleteMotor,
    selectedPond,
    isDeletingMotorPending
  } = props;
  const { isSupervisor, isAdmin } = useUserDetails()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deleteMotorId, setDeleteMotorId] = useState<number | null>(null);
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteMotorId(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteMotorId || !selectedPond?.id) {
      toast.error("Invalid motor or pond selection");
      return;
    }
    deleteMotor({ motorId: deleteMotorId, pondId: selectedPond.id });
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <div key={motor.id} className="border rounded-xl shadow hover:shadow-lg transition p-2 bg-gray-100 relative overflow">
      <div className="flex items-center justify-between bg-white rounded-md p-1 shadow-sm hover:shadow-md gap-2">
        <div className="flex items-center gap-2 text-sm font-normal text-gray-900 min-w-0 flex-shrink">
          <MotorSvg className="w-5 h-5 flex-shrink-0 text-blue-600" />
          <span className="truncate max-w-[90px] capitalize text-md text-gray-800" title={motor.title}>
            {motor.title?.length > 10 ? `${motor.title.slice(0, 10)}...` : motor.title}
          </span>
          <span className="flex mt-0.5 text-xs text-indigo-600 whitespace-nowrap flex-shrink-0">{motor.hp} HP</span>
          {motor?.starterBoxParameters[0]?.power_present == "1" ? (<PowerOn color="green" />) : (<PowerOn color="red" />)}


          <TooltipProvider delayDuration={300}>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <Tooltip open={isTooltipOpen && !isDropdownOpen} onOpenChange={setIsTooltipOpen}>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="outline-none focus:outline-none hover:scale-110 transition-transform"
                      onMouseEnter={() => setIsTooltipOpen(true)}
                      onMouseLeave={() => setIsTooltipOpen(false)}
                      onClick={() => {
                        setIsTooltipOpen(false);
                        setIsDropdownOpen(true);
                      }}
                    >
                      {(motor?.starterBoxParameters?.[0]?.fault_code &&
                        motor?.starterBoxParameters?.[0]?.fault_code != 0) ? (
                        <AlertIcon
                          className="w-5 h-5 text-red-600 flex-shrink-0 animate-blink"
                          fill="red"
                        />
                      ) : null}
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>

                <TooltipContent side="bottom" className="p-2  shadow-lg bg-white border border-gray-200">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span >
                      {getFaultDescription(motor?.starterBoxParameters[0]?.fault_code ?? 0)
                        .split(",")
                        .map((fault: string, index: number) => (
                          <div key={index} className="flex items-center gap-1 mt-1">
                            <AlertIcon
                              className="w-4 h-4 text-red-500  flex-shrink-0"
                              fill="red"
                            />
                            <span className="text-xs font-medium text-red-600">
                              {fault.trim()}
                            </span>
                          </div>
                        ))}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent
                className="p-2 shadow-lg bg-white border border-gray-200"
                align="start"
                side="bottom"
                sideOffset={5}
              >
                <span >
                  {getFaultDescription(motor?.starterBoxParameters[0]?.fault_code ?? 0)
                    .split(",")
                    .map((fault: string, index: number) => (
                      <div key={index} className="flex items-center gap-1 mt-1">
                        <AlertIcon
                          className="w-4 h-4 text-red-500  flex-shrink-0"
                          fill="red"
                        />
                        <span className="text-xs font-medium text-red-600">
                          {fault.trim()}
                        </span>
                      </div>
                    ))}
                </span>

              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>

        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {motor?.starterBox ? (
            <div className="flex items-center text-sm text-gray-700 gap-1">
              {motor.starterBox.status === "ACTIVE"
                ? <GreenDot className="w-3 h-3  bg-green-200 rounded-full border-2 border-green-200" />
                : <RedDot className="w-3 h-3 bg-red-200 rounded-full border-2 border-red-300" />}
              <span className="truncate max-w-[80px] capitalize text-sm text-gray-900 font-normal" title={motor.starterBox.alias_starter_title || motor.starterBox.title || "--"}>
                {motor.starterBox.alias_starter_title || motor.starterBox.title || "--"}
              </span>
              <span className="flex items-center text-xs tracking-tighter bg-sky-100 rounded px-2 py-0.5 text-gray-700 whitespace-nowrap">
                <DeviceNodeIcon className="h-3 w-3 mr-0.5 flex-shrink-0 text-gray-6 00" />
                {motor?.motor_ref_id === "mtr_1" ? "Node 1" : "Node 2"}
              </span>
              {(!isSupervisor() && !isAdmin()) && (
                <div className="relative">
                  <DropdownMenu
                    open={openMotorId == motor.id}
                    onOpenChange={(isOpen) => setOpenMotorId(isOpen ? motor.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 opacity-80 flex-shrink-0 hover:bg-gray-100 transition"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44 p-1 bg-white shadow-lg border border-gray-200" side="right" align="start">
                      <button
                        onClick={() => handleReplaceClick(motor)}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 rounded flex items-center gap-2 text-blue-700"
                      >
                        <ReplaceDeviceIcon className="w-3 h-3 text-blue-600" /> Replace Device
                      </button>
                      <button
                        onClick={() => handleRemoveDeviceClick(motor)}
                        className="w-full text-left px-2 py-1.5 gap-2 text-xs hover:bg-red-50 text-red-600 rounded flex items-center disabled:opacity-50"
                      >
                        <RemoveDeviceIcon className="w-3 h-3 text-red-600" /> Remove Device
                      </button>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {openDropdownMotorId === motor.id && isReplaceMode &&
                    deviceSelectionDropdown(motor, replaceDropdownRef)
                  }
                </div>
              )}


            </div>
          ) : (
            (isOwner() || isManager()) && (
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center  h-7  gap-0 px-2  text-xs font-normal border border-green-500 text-green-500 bg-green-50 hover:text-green-500 transition-all rounded-md shadow-sm whitespace-nowrap "
                  onClick={(e) => handleConfigClick(e, motor)}
                >
                  <DeviceConfigIcon className="w-2 h-2 flex-shrink-0 text-green-600 py-0.5  " />
                  <span className=""> Config</span>
                </Button>

                {openDropdownMotorId === motor.id && !isReplaceMode &&
                  deviceSelectionDropdown(motor, dropdownRef)
                }
              </div>
            )
          )}

          {!(isSupervisor() || isAdmin()) && (
            <button
              onClick={() => {
                setDeleteMotorId(motor.id);
                setIsDeleteDialogOpen(true);
              }}
              className="text-gray-600 hover:text-red-500 pb-0.5"
              title="Delete Motor"
            >
              <DeleteDeviceIcon className="size-4" />
            </button>
          )}

        </div>
      </div>



      <div className="flex items-center justify-start text-sm pt-1 space-x-2  ">
        <div className="w-4/5 flex justify-center items-center px-4 gap-6 ">

          <div className="flex flex-col  gap-1 flex-shrink-0 px-3 py-1.5 ">

            <div className="flex  items-center gap-1 ">
              <div className="flex items-center gap-1 text-xs font-medium text-gray-600 ">
                <VoltsIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>V :</span>
              </div>
              <div className="flex items-center gap-1 ">
                <span className="text-red-600 text-xs font-medium min-w-[35px] text-left">
                  {formatValue(motor?.starterBoxParameters?.[0]?.line_voltage_vry) ?? "--"}
                </span>
                <span className="text-yellow-600 text-xs font-medium min-w-[35px] text-left">
                  {formatValue(motor?.starterBoxParameters?.[0]?.line_voltage_vyb) ?? "--"}
                </span>
                <span className="text-blue-600 text-xs font-medium min-w-[35px] text-left">
                  {formatValue(motor?.starterBoxParameters?.[0]?.line_voltage_vbr) ?? "--"}
                </span>
              </div>
            </div>


            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                <MeterIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>A :</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-red-600 text-xs font-medium min-w-[35px] text-left">
                  {formatValue(motor?.starterBoxParameters?.[0]?.current_i1) ?? "--"}
                </span>
                <span className="text-yellow-600 text-xs font-medium min-w-[35px] text-left">
                  {formatValue(motor?.starterBoxParameters?.[0]?.current_i2) ?? "--"}
                </span>
                <span className="text-blue-600 text-xs font-medium min-w-[35px] text-left">
                  {formatValue(motor?.starterBoxParameters?.[0]?.current_i3) ?? "--"}
                </span>
              </div>
            </div>
          </div>

          <MotorModeButton
            motor={motor}
            selectedMotorModes={selectedMotorModes}
            onModeChange={handleMotorModeToggle}
          />

        </div>

        <MotorControlButton
          motor={motor}
          selectedMotors={selectedMotors}
          handleMotorControlToggle={handleMotorControlToggle}
        />




      </div>

      <DeleteDialog
        openOrNot={isDeleteDialogOpen}
        label="Are you sure you want to delete this motor?"
        onCancelClick={handleDeleteCancel}
        onOKClick={handleDeleteConfirm}
        deleteLoading={isDeletingMotorPending}
        buttonLable="Yes! Delete"
        buttonLabling="Deleting..."
      />

    </div>
  );
};

export default MotorCard;
