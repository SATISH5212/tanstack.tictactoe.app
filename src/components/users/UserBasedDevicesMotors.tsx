import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import HighCharts from "src/components/HighCharts";
import { NoDeviceMotorData } from "src/components/svg/NoDeviceMotorData";
import { capitalize } from "src/lib/helpers/capitalize";
import { getSingleUserMotersAPI } from "src/lib/services/users";

import PondCountIcon from "../icons/PondCount";

import { EmptyMotorsGraph } from "../devices/EmptyMotorsGraph";
import { MotorDetailsDrawer } from "../deviceSettings/MotorDetailsDrawer";
import StarterBoxSettings from "../StarterBoxSettings";



export const UserBasedDevicesMotors = ({
  selectedDeviceId,
}: {
  selectedDeviceId?: any;
}) => {
  const navigate = useNavigate();
  const { device_id, user_id } = useParams({ strict: false });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const capableMotors = Number(searchParams.get("capable_motors")) || 1;
  const motor_ref_id = searchParams.get("motor_ref_id") || "mtr_1";

  const [dateValue, setDateValue] = useState<{
    from_date: string;
    to_date: string;
  } | null>(null);
  const [dateRange, setDateRange] = useState<{
    from_date: string;
    to_date: string;
  } | null>(dateValue || null);
  const [noMotors, setNoMotors] = useState(false);
  const [showNoMotorsPage, setShowNoMotorsPage] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<any | null>(null);

  const [starterId, setStarterId] = useState("");
  const [gateway, setGateway] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasActualMotors, setHasActualMotors] = useState(false);

  const { data: userMotorsData, isFetching: isMotorsLoading } = useQuery({
    queryKey: ["userMotors", selectedDeviceId, device_id],
    queryFn: async () => {
      const response = await getSingleUserMotersAPI(
        selectedDeviceId || device_id
      );
      if (response.status === 200 || response.status === 201) {
        setGateway(response?.data?.data[0]?.gateways?.title || "");
        const motors = response?.data?.data[0]?.motors || [];
        const apiCapableMotors = response?.data?.data[0]?.capable_motors || 1;
        if (motors.length === 0) {
          setNoMotors(true);
          setShowNoMotorsPage(true);
          setHasActualMotors(false);
        } else {
          setNoMotors(false);
          setShowNoMotorsPage(false);
          setHasActualMotors(true);
          setSelectedMotor(motors[0]);
        }
        setStarterId(response?.data?.data[0]?.id || "");
        return response?.data?.data || [];
      } else {
        throw new Error("Failed to fetch motors data");
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: !!selectedDeviceId || !!device_id,
  });


  useEffect(() => {
    if (userMotorsData && !hasActualMotors && !showNoMotorsPage) {
      const apiCapableMotors = userMotorsData[0]?.capable_motors || 1;
      const motorNum =
        motor_ref_id === "mtr_1" ? "1" : motor_ref_id === "mtr_2" ? "2" : "1";
      if (
        apiCapableMotors >= parseInt(motorNum) &&
        ["mtr_1", "mtr_2"].includes(motor_ref_id)
      ) {
        setSelectedMotor({
          id: motor_ref_id,
          title: `Motor ${motorNum} (M${motorNum})`,
          motor_ref_id: motor_ref_id,
          hp: "",
          state: 0,
          pond: { id: "", title: "", location: { id: "", title: "" } },
        });
        setNoMotors(false);
      } else {
        setNoMotors(true);
        setSelectedMotor(null);
      }
    }
  }, [motor_ref_id, userMotorsData, hasActualMotors, showNoMotorsPage]);

  const handleMotorClick = (motor: any) => {
    setSelectedMotor(motor);
    setNoMotors(false);
    setShowNoMotorsPage(false);
    const motorRefId = motor?.motor_ref_id || "mtr_1";
    navigate({
      to: `/users/${user_id}/devices/${device_id}`,
      search: {
        motor_id: motor?.id,
        motor_ref_id: motorRefId,
        capable_motors: userMotorsData?.[0]?.capable_motors || 1,
      },
    });
  };

  const handleNoMotorsClick = () => {
    const apiCapableMotors = userMotorsData?.[0]?.capable_motors || 1;
    setShowNoMotorsPage(false);
    setNoMotors(false);
    setSelectedMotor({
      id: "mtr_1",
      title: "Motor 1 (M1)",
      motor_ref_id: "mtr_1",
      hp: "",
      state: 0,
      pond: { id: "", title: "", location: { id: "", title: "" } },
    });
    navigate({
      to: `/users/${user_id}/devices/${device_id}`,
      search: {
        motor_ref_id: "mtr_1",
        capable_motors: apiCapableMotors,
      },
    });
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    if (!hasActualMotors) {
      setNoMotors(true);
      setShowNoMotorsPage(true);
      setSelectedMotor(null);
    }
  };

  if (showNoMotorsPage) {
    return (
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
    );
  }

  return (
    <div className="overflow-y-auto h-device_diagram">
      {isMotorsLoading ? (
        <div className="flex justify-center items-center w-full h-device_diagram text-gray-500">
          <img
            src="/PeepulAgriLogo.svg"
            alt="Logo"
            className="w-20 h-20 p-2"
          />
        </div>
      ) : (
        <>
          {userMotorsData?.[0]?.motors?.length ? (
            <div className="flex gap-3 2xl:text-xs lg:text-xs px-6">
              <figure className="rounded-lg overflow-hidden bg-white border border-gray-200 w-full">
                <header className="flex items-center justify-between px-4 py-2 bg-gray-100">
                  <div className="flex items-center gap-2">
                    {/* <MotorImg /> */}
                    <span className="text-sm font-medium">Motors</span>
                  </div>
                  <StarterBoxSettings gateway={gateway} deviceId={starterId} />
                </header>
                <div className="w-full overflow-hidden">
                  <div className="overflow-auto flex">
                    {userMotorsData?.[0]?.motors?.map((motor: any) => (
                      <div
                        key={motor?.id}
                        className="px-2 py-2 cursor-pointer"
                        onClick={() => handleMotorClick(motor)}
                      >
                        <div
                          className={`flex flex-col w-60 h-fit gap-1 rounded-lg border flex-shrink-0 overflow-hidden ${motor?.id === selectedMotor?.id
                            ? "border-green-400"
                            : "border-slate-200 hover:bg-gray-50"
                            }`}
                        >
                          <div className="flex items-center justify-between p-2 w-full bg-blue-50">
                            <div className="w-full flex items-center justify-between gap-2">
                              <span>
                                {motor?.title ? capitalize(motor?.title) : "--"}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="bg-green-100 rounded-full size-2 relative">
                                  <span
                                    className={`size-1.5 rounded-full ${motor?.state === 1
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                      } absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1`}
                                  />
                                </span>
                                <span>{motor?.state === 1 ? "ON" : "OFF"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3 p-2 py-3">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <PondCountIcon className="size-4" />
                                <span title={motor?.pond?.title || "--"}>
                                  {motor?.pond?.title
                                    ? `${motor?.pond?.title
                                      .charAt(0)
                                      .toUpperCase() +
                                    motor?.pond?.title.slice(1).slice(0, 17)
                                    }${motor?.pond?.title.length > 17 ? "..." : ""}`
                                    : "--"}
                                </span>
                              </div>
                              <span>
                                {motor?.hp ? motor?.hp : "--"}{" "}
                                {motor?.hp ? "HP" : ""}
                              </span>
                            </div>
                            <div className="flex justify-end">
                              {motor?.mode ? motor?.mode : "--"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </figure>
            </div>
          ) : (
            <EmptyMotorsGraph
              device_id={device_id}
              capableMotors={userMotorsData?.[0]?.capable_motors || 1}
              motor_ref_id={motor_ref_id}
              device_name={userMotorsData?.[0]?.title || "-"}
            />
          )}
        </>
      )}

      {selectedMotor && (
        <>
          <div className="pt-2 px-6">
            <HighCharts
              motorData={selectedMotor}
              starterId={starterId}
              dateValue={dateValue}
              setDateValue={setDateValue}
              dateRange={dateRange}
              setDateRange={setDateRange}
              paramater="runtime"
              userMotorsData={userMotorsData}
              noMotors={noMotors}
              motor_ref_id={motor_ref_id}
            />
          </div>
          <div className="pt-2 px-6">
            <HighCharts
              motorData={selectedMotor}
              starterId={starterId}
              dateValue={dateValue}
              setDateValue={setDateValue}
              dateRange={dateRange}
              setDateRange={setDateRange}
              paramater="voltage"
              userMotorsData={userMotorsData}
              noMotors={noMotors}
              motor_ref_id={motor_ref_id}
            />
          </div>
          <div className="py-2 px-6">
            <HighCharts
              motorData={selectedMotor}
              starterId={starterId}
              dateValue={dateValue}
              setDateValue={setDateValue}
              dateRange={dateRange}
              setDateRange={setDateRange}
              paramater="current"
              userMotorsData={userMotorsData}
              noMotors={noMotors}
              motor_ref_id={motor_ref_id}
            />
          </div>
        </>
      )}
      <MotorDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        motor={selectedMotor}
        userMotorsData={userMotorsData}
      />
    </div>
  );
};
