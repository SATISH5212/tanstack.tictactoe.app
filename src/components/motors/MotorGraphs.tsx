import { useLocation, useParams } from "@tanstack/react-router";
import * as React from "react";
import { DateRange } from "react-day-picker";
import CustomDateCalendar from "../customDateCalendar";
import Graphs from "../graphs";

const GRAPH_PARAMS = ["runtime", "voltage", "current"] as const;
type GraphParam = (typeof GRAPH_PARAMS)[number];

const MotorGraphs = () => {
  const { device_id, motor_id } = useParams({ strict: false });
  const location = useLocation();
  const [date, setDate] = React.useState<DateRange | undefined>();
  const searchParams = new URLSearchParams(location.search);
  const rawDataGraphs = searchParams.has("rawDataGraphs");

  if (!device_id || !motor_id) {
    return (
      <div className="flex items-center justify-center h-device_graph text-gray-500">
        Invalid device or motor
      </div>
    );
  }

  // const { isLoading } = useQuery({
  //   queryKey: ["singleMotor", device_id],
  //   enabled: true,
  //   staleTime: 5 * 60 * 1000,
  //   retry: 1,
  //   refetchOnWindowFocus: false,
  //   queryFn: async () => {
  //     const response = await getSingleMotorAPI(device_id);
  //     if (!response?.success) {
  //       throw new Error("Failed to fetch motor data");
  //     }
  //     return response.data?.data;
  //   },
  // });

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center w-full h-device_graph text-gray-500">
  //       <Loader className="h-6 w-6 animate-spin" />
  //     </div>
  //   );
  // }

  return (
    <div className="py-2 h-[calc(100vh-50px)]  ">
      <div className="flex flex-row justify-between  items-center px-2 py-2">
        <div className="text-md ">DeviceTitle</div>
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
      {GRAPH_PARAMS.map((param: GraphParam) => (
        <div key={param} className="px-2 pt-1 overflow-y-auto">
          <Graphs
            starterId={device_id}
            motorId={motor_id}
            date={date}
            graphType={param}
            rawDataGraphs={rawDataGraphs}
          />
        </div>
      ))}
    </div>
  );
};

export default MotorGraphs;
