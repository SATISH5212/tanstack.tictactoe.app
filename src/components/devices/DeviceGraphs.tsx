import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { capitalize } from "src/lib/helpers/capitalize";
import {
  getGatewayTitleAPI,
  getSingleMotorAPI,
} from "src/lib/services/deviceses";
import HighCharts from "../HighCharts";
import { EmptyMotorsGraph } from "./EmptyMotorsGraph";
import { MeterIcon } from "../svg/MeterIcon";
import { ThunderIcon } from "../svg/ThunderIcon";
import { PlugIcon } from "../svg/PlugIcon";
import { DetailsIcon } from "../svg/DetailsIcon";
import { WhiteMotorIcon } from "../svg/WhiteMotor";
const DeviceGraphs = ({
  motor,
  deviceData,
  capable_motors,
  singleData,
  userMotorsData,
}: any) => {
  const { device_id, motor_id } = useParams({ strict: false });
  const [motorData, setMotorData] = React.useState({});
  const [dateValue, setDateValue] = React.useState<Date[] | null>(null);
  const [dateRange, setDateRange] = React.useState<{
    from_date: string;
    to_date: string;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const capableMotorsFromSearch =
    Number(searchParams.get("capable_motors")) || 0;
  const capableMotors =
    capableMotorsFromSearch ||
    capable_motors ||
    singleData?.[0]?.capable_motors ||
    userMotorsData?.[0]?.capable_motors ||
    1;
  const pond_id = searchParams.get("pondId");
  const ipv6 = searchParams.get("ipv6");
  const motor_ref_id = motor_id || searchParams.get("motor_ref_id") || "mtr_1";
  const currentDevice = deviceData?.find(
    (device: any) => device.id === Number(device_id)
  );
  const {
    data: singleMotorData,
    error: motorError,
    isLoading: isMotorLoading,
  } = useQuery({
    queryKey: ["singleMotor", device_id, motor_ref_id],
    queryFn: async () => {
      if (!device_id) {
        throw new Error("Device ID is missing");
      }
      if (
        (capableMotors === 1 || capableMotors === 2) &&
        (!motor_id || motor_id === "mtr_1" || motor_id === "mtr_2")
      ) {
        return {
          title: motor_ref_id === "mtr_1" ? "Motor 1 (M1)" : "Motor 2 (M2)",
          device_name: currentDevice?.title || "-",
          pcb_number: currentDevice?.serial_no || "-",
          ipv6: currentDevice?.ipv6 || "",
          connected_motors: [],
        };
      }
      const response = await getSingleMotorAPI(motor_id);
      if (response.success) {
        const data = response?.data?.data;
        setMotorData(data);
        return data;
      }
    },
    enabled: !!device_id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: gatewayData } = useQuery({
    queryKey: ["getgatewaytitle"],
    queryFn: async () => {
      const response = await getGatewayTitleAPI();
      return response.data?.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const sharedDateState = React.useMemo(
    () => ({
      dateValue,
      setDateValue,
      dateRange,
      setDateRange,
    }),
    [dateValue, dateRange]
  );
  return (
    <div className="py-2 h-[calc(100vh-120px)] overflow-auto">
      {isMotorLoading ? (
        <div className="flex justify-center items-center w-full h-device_graph text-gray-500">
          <img src="/PeepulAgriLogo.svg" alt="Logo" className="w-32 h-32" />
        </div>
      ) : !singleData?.[0]?.motors?.length &&
        !userMotorsData?.[0]?.motors?.length ? (
        <>
          <EmptyMotorsGraph
            device_id={device_id}
            pond_id={pond_id}
            ipv6={singleMotorData?.ipv6 || currentDevice?.ipv6 || ""}
            capableMotors={capableMotors}
            motor_ref_id={motor_ref_id}
            device_name={singleMotorData?.device_name || "-"}
            motorCount={capableMotors}
          />
          <div className="px-6">
            <div className="pt-2">
              <HighCharts
                starterId={device_id}
                motorData={singleMotorData}
                {...sharedDateState}
                paramater="voltage"
                motor_ref_id={motor_ref_id} 
                className="h-100"
                singleData={singleData}
                userMotorsData={userMotorsData}
              />
            </div>
            <div className="py-2">
              <HighCharts
                starterId={device_id}
                motorData={singleMotorData}
                {...sharedDateState}
                paramater="current"
                motor_ref_id={motor_ref_id}
                className="h-100"
                singleData={singleData}
                userMotorsData={userMotorsData}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex w-full gap-3 2xl:text-xs lg:text-xs px-6">
          <div className="border border-gray-300 rounded-xl bg-white overflow-hidden w-custom_55per">
            <div className="p-2 bg-gray-50 border-l font-medium text-gray-500 flex items-center justify-between">
              {singleMotorData?.title
                ? capitalize(singleMotorData.title)
                : "--"}
              <span>
                {singleMotorData?.hp ? singleMotorData.hp : "-"}
                {singleMotorData?.hp ? " HP" : ""}
              </span>
            </div>
            <div className="w-full">
              <div className="h-full py-custom_10per">
                <table className="w-full h-full">
                  <tbody className="space-y-4 h-full">
                    <tr className="flex items-center justify-between pl-2">
                      <th className="flex items-center">
                        <div className="flex items-center gap-2 font-normal responsive-font">
                          <ThunderIcon />
                          <div>Voltage(V) :</div>
                        </div>
                      </th>
                      <td className="flex items-center justify-center responsive-font relative">
                        <span className="h-1 w-custom_85per rounded-full absolute -top-1.5 bg-red-500"></span>
                        <div>{singleMotorData?.line_voltage_vry || "0"}</div>
                      </td>
                      <td className="flex items-center justify-center responsive-font relative">
                        <span className="h-1 w-custom_85per rounded-full absolute -top-1.5 bg-yellow-500"></span>
                        {singleMotorData?.line_voltage_vyb || "0"}
                      </td>
                      <td className="flex items-center justify-center mr-1.5 responsive-font relative">
                        <span className="h-1 w-custom_85per rounded-full absolute -top-1.5 bg-blue-500"></span>
                        {singleMotorData?.line_voltage_vbr || "0"}
                      </td>
                    </tr>
                    <tr className="flex items-center justify-between pl-2">
                      <th className="flex items-center">
                        <div className="flex items-center gap-2 font-normal responsive-font">
                          <MeterIcon />
                          <div>Current(A) :</div>
                        </div>
                      </th>
                      <td className="flex items-center justify-center responsive-font">
                        {singleMotorData?.current_i1 || "0"}
                      </td>
                      <td className="flex items-center justify-center responsive-font">
                        {singleMotorData?.current_i2 || "0"}
                      </td>
                      <td className="flex items-center justify-center pr-4 responsive-font">
                        {singleMotorData?.current_i3 || "0"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="border-gray-300 rounded-xl bg-white overflow-hidden w-custom_45per border space-y-5">
            <div className="flex justify-between p-2 bg-gray-50 border-l font-medium text-gray-500 gap-5">
              <div className="w-full truncate">
                {singleMotorData?.device_name
                  ? capitalize(singleMotorData?.device_name)
                  : "-"}
              </div>
            </div>
            <div className="px-2">
              <div className="w-full space-y-5">
                <div className="flex items-center justify-between gap-8 w-full">
                  <div className="flex items-center gap-2 flex-shrink-0 w-1/2">
                    <DetailsIcon className="mt-2" />
                    <div>Device ID:</div>
                  </div>
                  <div
                    className="w-1/2 truncate cursor-pointer"
                    title={singleMotorData?.pcb_number}
                  >
                    {singleMotorData?.pcb_number || "-"}
                  </div>
                </div>
                <div className="px-2">
                  <div className="w-full space-y-5">
                    <div className="">
                      <div className="flex items-center gap-2">
                        <PlugIcon />
                        <div>Connected Motors</div>
                      </div>
                      <div className="w-full flex gap-2 items-center py-2 flex-nowrap overflow-x-auto scrollbar-hidden">
                        <div className="w-full flex gap-2 flex-nowrap">
                          {singleMotorData?.connected_motors?.length > 0 ? (
                            singleMotorData.connected_motors
                              .sort((a: any, b: any) => {
                                if (a.motor_ref_id === "mtr_1") return -1;
                                if (b.motor_ref_id === "mtr_1") return 1;
                                if (a.motor_ref_id === "mtr_2") return -1;
                                return 0;
                              })
                              .map((motor: any) => (
                                <div
                                  key={motor.id}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                    motor_id === String(motor.id)
                                      ? "bg-green-50 border border-green-200"
                                      : "bg-gray-50 border border-gray-200"
                                  } shrink-0 cursor-pointer`}
                                  onClick={() => {
                                    navigate({
                                      to: `/devices/${device_id}/motors/${motor.id}`,
                                      search: {
                                        // pondId: String(motor.pond?.id || ""),
                                        // ipv6: String(
                                        //   singleMotorData?.ipv6 ||
                                        //     currentDevice?.ipv6 ||
                                        //     ""
                                        // ),
                                        motor_ref_id: motor.motor_ref_id || "",
                                        capable_motors:
                                          capableMotors ||
                                          singleMotorData?.connected_motors
                                            ?.length ||
                                          0,
                                      },
                                    });
                                  }}
                                >
                                  <WhiteMotorIcon />
                                  <div className="text-xs">
                                    {motor.motor_ref_id === "mtr_1"
                                      ? "Motor 1 "
                                      : motor.motor_ref_id === "mtr_2"
                                        ? "Motor 2 "
                                        : capitalize(motor.title)}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-gray-400 text-sm">
                              No motor connected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isMotorLoading &&
        !motorError &&
        singleMotorData?.connected_motors?.length > 0 && (
          <div className="pt-2 px-6">
            <HighCharts
              starterId={device_id}
              motorData={singleMotorData}
              {...sharedDateState}
              paramater="runtime"
              motor_ref_id={motor_ref_id}
              singleData={singleData}
            />
          </div>
        )}
      {!isMotorLoading &&
        !motorError &&
        singleMotorData?.connected_motors?.length > 0 && (
          <div className="pt-2 px-6">
            <HighCharts
              starterId={device_id}
              motorData={singleMotorData}
              {...sharedDateState}
              paramater="voltage"
              motor_ref_id={motor_ref_id}
              singleData={singleData}
            />
          </div>
        )}
      {!isMotorLoading &&
        !motorError &&
        singleMotorData?.connected_motors?.length > 0 && (
          <div className="py-2 px-6">
            <HighCharts
              starterId={device_id}
              motorData={singleMotorData}
              {...sharedDateState}
              paramater="current"
              motor_ref_id={motor_ref_id}
              singleData={singleData}
            />
          </div>
        )}
    </div>
  );
};
export default DeviceGraphs;
