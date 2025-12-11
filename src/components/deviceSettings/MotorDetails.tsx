import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";
import {
  getGatewayTitleAPI,
  getSingleDeviceAPI,
} from "src/lib/services/deviceses";
import DeviceImg from "../icons/devices/DeviceImage";
import MotorImg from "../icons/devices/MotorImage";
import { NoDeviceMotorData } from "../svg/NoDeviceMotorData";
import { Card } from "../ui/card";
import { MotorDetailsDrawer } from "./MotorDetailsDrawer";

import { capitalize } from "src/lib/helpers/capitalize";
import SettingsIcon from "../icons/devices/SettingsIcon";
import StarterBoxSettings from "../StarterBoxSettings";
import { Device } from "@/lib/interfaces/mqtt/motor";
import { useUserDetails } from "@/lib/helpers/userpermission";

const MotorDetails = () => {
  const queryClient = useQueryClient();
  const { device_id } = useParams({ strict: false });
  const { isAdmin } = useUserDetails();
  const navigate = useNavigate();
  const [searchString, setSearchString] = useState("");
  const [expandedDevice, setExpandedDevice] = useState<number | null>(null);
  const [selectedMotor, setSelectedMotor] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gateway, setGateway] = useState("");
  const {
    data: singleData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["single-device", device_id, searchString],
    queryFn: async () => {
      if (!device_id) return [];
      const response = await getSingleDeviceAPI(device_id);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch device data");
      }
      const deviceData: Device[] = response?.data?.data || [];
      setGateway(deviceData[0]?.gateways?.title || "");
      if (!searchString) return deviceData;
      const searchLower = searchString.toLowerCase();
      return deviceData.map((device) => ({
        ...device,
        motors: device.motors.filter((motor) => {
          const stateDisplay = motor.state !== 0 ? "on" : "off";
          const searchableValues = [
            String(motor.id),
            motor.title?.toLowerCase() || "",
            motor.hp !== null ? String(motor.hp) : "",
            String(motor.state),
            stateDisplay,
            motor.pond?.title?.toLowerCase() || "",
            motor.pond?.location?.title?.toLowerCase() || "",
          ];
          return searchableValues.some(
            (value) => value && value.includes(searchLower)
          );
        }),
      }));
    },
    enabled: !!device_id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: gatewayData, refetch: refetchGateway } = useQuery({
    queryKey: ["getgatewaytitle"],
    queryFn: async () => {
      const response = await getGatewayTitleAPI();
      return response.data?.data;
    },
    refetchOnWindowFocus: false,
  });

  const handleCardClick = (motor: any) => {
    setSelectedMotor(motor);
    setIsDrawerOpen(true);
    setExpandedDevice(
      expandedDevice === Number(device_id) ? null : Number(device_id)
    );
    const motorId = String(motor?.id || "");
    const motorRefId = motor?.motor_ref_id || "";
    navigate({
      to: `/devices/${device_id}/motors/${motorId}`,
      search: {
        motor_ref_id: motorRefId,
        capable_motors: singleData?.[0]?.capable_motors,
      },
    });
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    queryClient.invalidateQueries({ queryKey: ["single-device", device_id] });
  };
  const handleNoMotorsClick = (): any => {
    if (
      singleData?.[0]?.capable_motors === 2 ||
      singleData?.[0]?.capable_motors === 1
    ) {
      const defaultMotor = {
        id: "mtr_1",
        title: "Motor 1 (M1)",
        motor_ref_id: "mtr_1",
        hp: "",
        state: 0,
        pond: { id: "", title: "", location: { id: "", title: "" } },
      };
      setSelectedMotor(defaultMotor);
      setIsDrawerOpen(true);
      setExpandedDevice(Number(device_id));
      navigate({
        to: `/devices/${device_id}/motors/mtr_1`,
        search: {
          motor_ref_id: "mtr_1",
          capable_motors: singleData?.[0]?.capable_motors,
        },
      });
    }
  };
  return (
    <div className="w-full flex overflow-y-auto">
      <div className="w-full p-4 space-y-4 border-r border-slate-200">
        <div className="h-device_diagram overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-gray-500 py-4 w-full h-full box-border flex flex-col items-center justify-center">
              <img src="/PeepulAgriLogo.svg" alt="Logo" className="w-32 h-32" />
            </div>
          ) : isError ? (
            <div className="text-center text-gray-500 py-4">
              No motors found
            </div>
          ) : singleData?.length === 0 || !singleData?.[0]?.motors?.length ? (
            <div className="text-center text-gray-500 py-4 w-full h-full box-border flex flex-col items-center justify-center">
              <NoDeviceMotorData />
              <p>
                <p> No motors are linked from the user app. </p>
                <button
                  onClick={handleNoMotorsClick}
                  className="text-blue-500 hover:text-blue-700 underline font-medium"
                >
                  Click here
                </button>{" "}
                to view motor analytics raw data.
              </p>
            </div>
          ) : (
            singleData?.map((device: Device) => (
              <div
                key={device?.id}
                className="flex flex-col items-center px-4 justify-center h-device_diagram overflow-y-auto"
              >
                <Card className="flex items-center justify-between py-2 px-3 bg-F3FBFF border border-sky-300 rounded-md shadow ml-custom_4per relative z-0.5">
                  <button
                    className="flex items-center gap-3 cursor-pointer"
                    disabled={!isAdmin()}
                    title={
                      !isAdmin()
                        ? "You are not authorized to view this device-settings"
                        : ""
                    }
                    onClick={handleSettingsClick}
                  >
                    <div className="p-2 bg-blue-900 rounded-full">
                      <DeviceImg className="w- h-3" />
                    </div>
                    <div>
                      <p className="text-md 3xl:text-xl font-medium text-gray-500">
                        {(() => {
                          const title = device?.title || "--";
                          const alias = device?.alias_starter_title;
                          if (!isAdmin()) {
                            return alias ? capitalize(alias) : title;
                          }
                          return title ? capitalize(title) : "--";
                        })()}
                      </p>

                      <p className="text-xs text-gray-500">
                        {device?.serial_no || "--"}
                      </p>
                    </div>
                    {isAdmin() && (
                      <SettingsIcon className="size-4 text-[#292929]" />
                    )}
                  </button>
                  <svg
                    className="w-2 h-2 absolute -bottom-1 left-custom_value"
                    xmlns="http://www.w3.org/2000/svg"
                    width="4"
                    height="4"
                    viewBox="0 0 4 4"
                    fill="none"
                  >
                    <circle cx="2" cy="2" r="2" fill="#909090" />
                  </svg>
                </Card>
                <div className="flex flex-col gap-8 mt-[75px] relative">
                  <div className="absolute bottom-[2.7rem] left-0 h-full w-full border-l border-b border-primary rounded-lg"></div>
                  <div className="absolute -top-[79px]  h-8 w-[50%]  border-b border-r border-primary rounded-custom_00100"></div>

                  {[...(device?.motors || [])]
                    .sort((a, b) => {
                      if (a.motor_ref_id === "mtr_1") return -1;
                      if (b.motor_ref_id === "mtr_1") return 1;
                      if (a.motor_ref_id === "mtr_2") return -1;
                      return 0;
                    })
                    .map((motor, index) => (
                      <div key={motor?.id} className="flex items-center">
                        <div className="relative">
                          <svg
                            className="bg-[#45A845]"
                            xmlns="http://www.w3.org/2000/svg"
                            width="200"
                            height="1"
                            viewBox="0 0 116 1"
                            fill="none"
                          >
                            <path
                              d="M0 0.5H115.5H116.5"
                              stroke={
                                index < device.motors.length - 1
                                  ? "#45A845"
                                  : "transparent"
                              }
                              strokeOpacity={
                                index < device.motors.length - 1 ? "1" : "0.6"
                              }
                            />
                          </svg>
                          <div className="w-12 text-center text-black/80 bg-E0E0E0 border border-C8C8C8 text-xxs py-0.5 rounded-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            Starter-{motor.motor_ref_id === "mtr_1" ? "1" : "2"}
                          </div>
                        </div>
                        <Card
                          onClick={() => handleCardClick(motor)}
                          className="flex flex-col p-4 bg-F6FFFA border border-80D7AD rounded-md shadow relative z-1 cursor-pointer"
                        >
                          <svg
                            className="w-2 h-1 absolute -left-0.5 top-1/2 "
                            xmlns="http://www.w3.org/2000/svg"
                            width="4"
                            height="4"
                            viewBox="0 0 4 4"
                            fill="none"
                          >
                            <circle cx="2" cy="2" r="2" fill="#909090" />
                          </svg>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1">
                              <MotorImg className="w-4 h-4" />
                              <p
                                title={motor?.title}
                                className="text-xs text-gray-600 font-medium w-16 whitespace-nowrap text-ellipsis overflow-hidden leading-tight"
                              >
                                {motor?.title ? capitalize(motor?.title) : "--"}
                                <span className="block text-xxs mt-0.5">
                                  {motor?.hp || "--"} {motor?.hp ? "HP" : ""}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5 text-xxs px-1 py-0.5 rounded-full">
                              {motor?.state === 1 ? (
                                <div className="flex items-center gap-0.5 text-green-500 text-xxs bg-green-50 px-1 py-0.5 rounded-full">
                                  <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                  <span className="text-green-500">ON</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-0.5 text-red-500 text-xxs bg-red-50 px-1 py-0.5 rounded-full">
                                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                  <span className="text-red-500">OFF</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center text-xxs text-gray-500 gap-0.5">
                              <MapPin className="w-2 h-2" />
                              <span>
                                {motor?.pond?.location?.title
                                  ? capitalize(motor?.pond?.location?.title)
                                  : "--"}
                              </span>
                            </div>
                            <p className="text-xxs text-gray-500">
                              {motor?.pond?.title
                                ? capitalize(motor?.pond?.title)
                                : "--"}
                            </p>
                          </div>
                        </Card>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <StarterBoxSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        hideTrigger={true}
        hideTriggerOne={false}
        setShowSettings={setShowSettings}
        gateway={gateway}
        deviceId={device_id}
        gatewayData={gatewayData}
      />
      <MotorDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        motor={selectedMotor}
        singleData={singleData}
        //   testStarterData={testStarterData}
        // deviceData={deviceData}
        // capableMotors={capableMotors}
        // isDeployed={isDeployedDevice}
        // isTestDevice={isTestDevice}
        // setTestStarterData={setTestStarterData}
      />
    </div>
  );
};

export default MotorDetails;
//asal
