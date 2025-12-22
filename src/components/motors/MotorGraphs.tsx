import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import * as React from "react";
import { DateRange } from "react-day-picker";
import CustomDateCalendar from "../core/CustomDateCalendar";
import Graphs from "../graphs";
import { getSingleDeviceAPI } from "@/lib/services/devices";
import { useQuery } from "@tanstack/react-query";
import BackButton from "../icons/BackButton";
import { Button } from "../ui/button";

const GRAPH_PARAMS = ["runtime", "voltage", "current"] as const;
type GraphParam = (typeof GRAPH_PARAMS)[number];

const MotorGraphs = () => {
  const { device_id: deviceId, motor_id } = useParams({ strict: false });
  const location = useLocation();
  const [date, setDate] = React.useState<DateRange | undefined>();
  const searchParams = new URLSearchParams(location.search);
  const rawDataGraphs = searchParams.has("rawDataGraphs");
  const navigate = useNavigate();
  if (!deviceId || !motor_id) {
    return (
      <div className="flex items-center justify-center h-device_graph text-gray-500">
        Invalid device or motor
      </div>
    );
  }

  const { data: singleDeviceData, isLoading } = useQuery({
    queryKey: ["single-device-data", deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      const response = await getSingleDeviceAPI(deviceId);
      console.log(response, "dev0dev0")
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch device data");
      }
      return response?.data?.data || {};
    },
    enabled: !!deviceId,
    staleTime: 5 * 60 * 1000,
  });

  const handleBackClick = () => {
    navigate({ to: "/devices", search: {} })
  }
  return (
    <div className="py-2 h-[calc(100vh-50px)]  ">
      <div className="flex flex-row justify-between  items-center px-2 py-2">
        <div className="text-md ">
          <div className="flex items-center">
            <Button
              onClick={handleBackClick}
              className="bg-white hover:bg-gray-50 "
            >
              <BackButton className="w-8 h-8 text-gray-700" />
            </Button>

            <span
              className="turncate text-lg sm:text-base font-medium text-gray-800 tracking-tight truncate capitalize"
              title={singleDeviceData?.name}
            >
              {singleDeviceData?.name}
            </span>

          </div>
        </div>
        <CustomDateCalendar
          date={date}
          setDate={setDate}
          align="start"
          title="Select Date"
          disablePast={false}
          disableFuture={true}
          isTimePicker={false}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center  h-full justify-center">Loading...</div>
      ) : (
        GRAPH_PARAMS.map((param: GraphParam) => (
          <div key={param} className="px-2 pt-1 overflow-y-auto">
            <Graphs
              starterId={deviceId}
              motorId={motor_id}
              date={date}
              graphType={param}
              rawDataGraphs={rawDataGraphs}
            />
          </div>
        ))
      )}

    </div>
  );
};

export default MotorGraphs;
