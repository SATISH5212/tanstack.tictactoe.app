import { getFaultDescription } from "@/lib/helpers/motorFaultCodes";
import { truncate } from "@/lib/helpers/truncate";
import { IMotorMarkerTooltipProps } from "@/lib/interfaces/maps";
import AlertIcon from "../svg/AlertsIcon";
import { DevicesSvg } from "../svg/DevicesSvg";
import { GreenDot } from "../svg/GreenDot";
import { MotorSvg } from "../svg/MotorSvg";
import { RedDot } from "../svg/RedDot";

const MotorInfoContent: React.FC<IMotorMarkerTooltipProps> = ({ motor }) => (
  <div className="w-55 p-2 bg-white/20 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-1 rounded">
      <div className="flex items-center gap-1">
        <MotorSvg className="h-4 w-4 " color="white" />
        <span
          className="font-normal text-[14px] capitalize text-white mr-1"
          title={motor.title}
        >
          {truncate(motor.title)}
        </span>
        <span className="flex text-[10px] text-amber-300  font-normal items-end mr-4 mt-1">
          {motor.hp} HP
        </span>
      </div>
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded ${
          motor.state === 1
            ? "text-white bg-green-600"
            : "text-white bg-red-600"
        }`}
      >
        {motor.state === 1 ? "ON" : "OFF"}
      </span>
    </div>

    <div className="border-t border-gray-400 my-1" />

    {motor?.faults == null || motor?.faults?.fault_code === 0 ? (
      <>
        <div className="flex items-center justify-between rounded p-1">
          <div className="flex items-center gap-1">
            {motor.starterBox ? (
              <>
                {motor.starterBox.status === "ACTIVE" ? (
                  <GreenDot className="w-2 h-2 flex-shrink-0 bg-green-200 rounded-full border border-green-200" />
                ) : (
                  <RedDot className="w-2 h-2 flex-shrink-0 bg-red-200 rounded-full border border-red-200" />
                )}
                <DevicesSvg className="w-4 h-4 flex-shrink-0 text-white" />
                <span
                  className="text-xs font-medium text-white capitalize"
                  title={
                    motor.starterBox.alias_starter_title ||
                    motor.starterBox.title
                  }
                >
                  {truncate(
                    motor.starterBox.alias_starter_title ||
                      motor.starterBox.title
                  )}
                </span>
              </>
            ) : (
              <span className="text-gray-700 text-xs font-medium">
                No starter box
              </span>
            )}
          </div>
        </div>

        {motor.starterBoxParameters?.[0] && (
          <div className="flex flex-col gap-1 rounded p-1">
            <div className="flex flex-row">
              <div className="text-xs text-white mr-1 p-0.5">V :</div>
              <div className="flex grow text-xs  ">
                <span className="flex justify-center w-1/3 text-white mr-2 border border-red-500 p-0.5">
                  {motor.starterBoxParameters[0].line_voltage_vry ?? "--"}
                </span>
                <span className="flex justify-center w-1/3 text-white mr-2 border border-yellow-500 p-0.5">
                  {motor.starterBoxParameters[0].line_voltage_vyb ?? "--"}
                </span>
                <span className="flex justify-center w-1/3 text-white border border-blue-500 p-0.5">
                  {motor.starterBoxParameters[0].line_voltage_vbr ?? "--"}
                </span>
              </div>
            </div>

            <div className="flex flex-row">
              <div className="flex text-xs text-white mr-1 p-0.5">A :</div>
              <div className="flex grow text-xs  ">
                <span className="flex justify-center w-1/3 text-white mr-2 border border-red-500 p-0.5">
                  {motor.starterBoxParameters[0].current_i1 ?? "--"}
                </span>
                <span className="flex justify-center w-1/3 text-white mr-2 border border-yellow-500 p-0.5">
                  {motor.starterBoxParameters[0].current_i2 ?? "--"}
                </span>
                <span className="flex justify-center w-1/3 text-white border border-blue-500 p-0.5">
                  {motor.starterBoxParameters[0].current_i3 ?? "--"}
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    ) : (

      <div className="flex flex-col min-w-0 flex-1"> 
        {(motor?.faults?.fault_code === 0 || !motor?.faults) ? (
          <div className="flex gap-1">
             <AlertIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="text-green-600 text-xs font-medium">{getFaultDescription(motor?.faults?.fault_code ?? 0)}</span>
          </div>
        ) : (
          getFaultDescription(motor?.faults?.fault_code ?? 0)
            .split(",")
            .map((fault: string, index: number) => (
              <div key={index} className="flex items-center gap-1 mt-1">
                <AlertIcon
                  className="w-4 h-4 text-red-500 animate-blink flex-shrink-0"
                  fill="red"
                />
                <span className="text-xs font-medium text-red-400">
                  {fault.trim()}{" ."}
                </span>
              </div>
            ))
        )}
      </div>
    )}
  </div>
);
export default MotorInfoContent;
