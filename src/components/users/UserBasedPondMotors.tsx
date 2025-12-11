import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import * as React from "react";
import { capitalize } from "src/lib/helpers/capitalize";
import {
  getSingleMotorAPI
} from "src/lib/services/deviceses";
import HighCharts from "../HighCharts";
import { MeterIcon } from "../svg/MeterIcon";
import { ThunderIcon } from "../svg/ThunderIcon";
import { PlugIcon } from "../svg/PlugIcon";
import { DetailsIcon } from "../svg/DetailsIcon";
import { WhiteMotorIcon } from "../svg/WhiteMotor";
const UserBasedPondMotors = ({
  singlemotordata,
}: {
  singlemotordata?: any;
}) => {
  const { motor_id, device_id } = useParams({ strict: false });
  const [motorData, setMotorData] = React.useState({});
  const [dateValue, setDateValue] = React.useState<{
    from_date: string;
    to_date: string;
  } | null>(null);
  const [dateRange, setDateRange] = React.useState<{
    from_date: string;
    to_date: string;
  } | null>(dateValue || null);
  const [open, setOpen] = React.useState(false);
  const searchParams = new URLSearchParams(location.search);
  const starterId = Number(searchParams.get("starter_id"));
  const {
    data: singledata,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["singleMotor", starterId, motor_id],
    queryFn: async () => {
      try {
        const response = await getSingleMotorAPI(motor_id);
        if (response.success) {
          const data = response?.data?.data;
          setMotorData(data);
          return data;
        } else {
          throw response;
        }
      } catch (errData) {
        console.error(errData);
        throw errData;
      }
    },
    enabled: true,
  });
  
  return (
    <div className="py-2">
      {isLoading ? (
        <div className="flex justify-center items-center w-full h-device_graph text-gray-500">
          <img src="/PeepulAgriLogo.svg" alt="Logo" className="w-32 h-32" />
        </div>
      ) : (
        <div className="flex w-full gap-3  2xl:text-xs lg:text-xs">
          <div className="border border-gray-300 rounded-xl bg-white overflow-hidden w-custom_56per">
            <div className="p-2 bg-gray-50 border-l font-semibold text-gray-500 flex items-center justify-between">
              {singledata?.title ? capitalize(singledata?.title) : "-"}
              <span>
                {singledata?.hp ? singledata?.hp : "-"}{" "}
                {singledata?.hp ? "HP" : ""}
              </span>
            </div>
            <div className="w-full">
              <div className="h-full py-6">
                <table className="w-full h-full">
                  <tbody className="space-y-3 h-full">
                    <tr className="flex items-center justify-between pl-2">
                      <th className="flex items-center">
                        <div className="flex items-center gap-1 font-normal responsive-font">
                          <ThunderIcon />
                          <div>Voltage(V) :</div>
                        </div>
                      </th>
                      <td className="flex items-center justify-center responsive-font relative">
                        <span className="h-1 w-custom_85per bg-red-500 absolute -top-1.5 rounded-full"></span>
                        <div>
                          {singledata?.line_voltage_vry === 0
                            ? "0"
                            : singledata?.line_voltage_vry || "-"}
                        </div>
                      </td>
                      <td className="flex items-center justify-center responsive-font relative">
                        <span className="h-1 w-custom_85per bg-yellow-500 absolute -top-1.5 rounded-full"></span>
                        {singledata?.line_voltage_vyb === 0
                          ? "0"
                          : singledata?.line_voltage_vyb || "-"}
                      </td>
                      <td className="flex items-center justify-center responsive-font relative mr-4 text-center">
                        <span className="h-1 w-custom_85per bg-blue-500 absolute -top-1.5 rounded-full"></span>
                        {singledata?.line_voltage_vbr === 0
                          ? "0"
                          : singledata?.line_voltage_vbr || "-"}
                      </td>
                    </tr>
                    <tr className="flex items-center justify-between pl-2 w-full">
                      <th className="flex items-center">
                        <div className="flex items-center gap-1 font-normal responsive-font">
                          <MeterIcon />
                          <div>Current(A) :</div>
                        </div>
                      </th>
                      <td className="flex items-center justify-center responsive-font text-center">
                        {singledata?.current_i1 === 0
                          ? "0"
                          : singledata?.current_i1 || "-"}
                      </td>
                      <td className="flex items-center justify-center responsive-font text-center">
                        {singledata?.current_i2 === 0
                          ? "0"
                          : singledata?.current_i2 || "-"}
                      </td>
                      <td className="flex items-center justify-center pr-4 responsive-font text-center">
                        {singledata?.current_i3 === 0
                          ? "0"
                          : singledata?.current_i3 || "-"}
                      </td>
                    </tr>
                    <tr className="flex items-center justify-between pl-2 w-full">
                      <th className="flex items-center"></th>
                      <td className="flex items-center justify-center responsive-font text-center pr-4">
                        {singledata?.time_stamp
                          ? dayjs
                            .utc(singledata.time_stamp)
                            .tz("Asia/Kolkata")
                            .format("DD-MM-YYYY hh:mm A")
                          : "--"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="border-gray-300 rounded-xl bg-white overflow-hidden w-custom_44per border space-y-5">
            <div className="flex justify-between p-2 bg-gray-50 border-l font-semibold text-gray-500 w-full">
              <div className="w-1/2 truncate" title={singledata?.device_name}>
                {singledata?.device_name}
              </div>
              <div
                title={`${singledata?.device_name}`}
                className="w-1/2 flex items-center justify-end"
              ></div>
            </div>
            <div className="px-2">
              <div className="w-full space-y-5">
                <div className="flex items-center justify-between gap-8 w-full">
                  <div className="flex items-center gap-1 flex-shrink-0 w-1/2">
                    <DetailsIcon className="mt-2" />
                    <div>Device ID:</div>
                  </div>
                  <div
                    className="w-1/2 truncate"
                    title={singledata?.pcb_number}
                  >
                    {singledata?.pcb_number?.length > 10
                      ? `${singledata?.pcb_number?.slice(0, 10)}...`
                      : singledata?.pcb_number}
                  </div>
                </div>
                <div className="">
                  <div className="flex items-center gap-1">
                    <PlugIcon />

                    <div>Connected Motors</div>
                  </div>
                  <div className="w-full flex items-center py-2 flex-nowrap overflow-x-auto scrollbar-hidden">
                    <div className="w-full flex gap-2 flex-nowrap">
                      {singledata?.connected_motors?.length > 0 ? (
                        singledata.connected_motors.map((motor: any) => (
                          <div
                            key={motor.id}
                            className="flex items-center gap-1 shrink-0"
                          >

                            <WhiteMotorIcon />
                            <div className="text-xs text-gray-800">
                              {motor.title ? motor.title : "-"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-sm">
                          No connected motors
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="py-2">
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-device_graph text-gray-500">
            Loading...
          </div>
        ) : (
          <>
            <div className="pt-2">
              <HighCharts
                motorData={singledata}
                dateValue={dateValue}
                setDateValue={setDateValue}
                dateRange={dateRange}
                setDateRange={setDateRange}
                paramater="runtime"

              />
            </div>
            <div className="pt-2">
              <HighCharts
                motorData={singledata}
                dateValue={dateValue}
                setDateValue={setDateValue}
                dateRange={dateRange}
                setDateRange={setDateRange}
                paramater="voltage"
                hideDatePicker={true}
              />
            </div>
            <div className="pt-2">
              <HighCharts
                motorData={singledata}
                dateValue={dateValue}
                setDateValue={setDateValue}
                dateRange={dateRange}
                setDateRange={setDateRange}
                paramater="current"
                hideDatePicker={true}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserBasedPondMotors;

