import { getRuntimeChartOptions } from "@/lib/helpers/graphs/getRuntimeChartOptions";
import { getVCChartOptions } from "@/lib/helpers/graphs/getVCChartOptions";
import { IGraphsProps } from "@/lib/interfaces/graphs";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FC, useMemo, useState } from "react";
import { getRunTimeGraphAPI, getVoltageAndCurrentGraphAPI, } from "@/lib/services/devices";
import { ClockIcon } from "../svg/ClockIcon";
import { MeterIcon } from "../svg/MeterIcon";
import { ThunderIcon } from "../svg/ThunderIcon";
import { useUserDetails } from "@/lib/helpers/userpermission";

const Graphs: FC<IGraphsProps> = (props) => {
    const {
        starterId,
        motorId,
        date,
        graphType,
        rawDataGraphs,
    } = props
    if (rawDataGraphs && graphType === "runtime") return null;
    const { isAdmin } = useUserDetails()
    const [totalMotorRunOnTime, setTotalMotorRunOnTime] = useState<string>("");
    const queryParams = useMemo(() => ({
        from_date: date?.from ? dayjs(date.from).format("YYYY-MM-DD") : undefined,
        to_date: date?.to ? dayjs(date.to).format("YYYY-MM-DD") : undefined,
    }), [date]);

    const isRuntime = graphType === "runtime";
    const isVC = graphType === "voltage" || graphType === "current";

    const vcQuery = useQuery({
        enabled: isVC && Boolean(starterId) && (rawDataGraphs || Boolean(motorId)),
        queryKey: ["vc-graph", graphType, starterId, rawDataGraphs ? "raw" : motorId, queryParams,],
        queryFn: async () => {
            const res = await getVoltageAndCurrentGraphAPI({
                starter_id: starterId,
                queryParams: {
                    ...queryParams,
                    parameter: graphType,
                    ...(rawDataGraphs ? {} : { motor_id: motorId }),
                },
            });
            return res?.data?.data ?? [];
        },
    });

    const runtimeQuery = useQuery({
        enabled: isRuntime && !rawDataGraphs && Boolean(starterId) && Boolean(motorId),
        queryKey: ["runtime-graph", starterId, motorId, queryParams],
        queryFn: async () => {
            const res = await getRunTimeGraphAPI({
                starter_id: starterId,
                queryParams: {
                    ...queryParams,
                    motor_id: motorId,
                },
            });
            setTotalMotorRunOnTime(res?.data?.data?.total_run_on_time)
            return res?.data?.data ?? [];
        },
    });

    const data = isRuntime ? runtimeQuery.data?.records : vcQuery.data;
    const isLoading = isRuntime ? runtimeQuery.isLoading : vcQuery.isLoading;
     const chartOptions = useMemo(() => {
        return isRuntime ? getRuntimeChartOptions(data, totalMotorRunOnTime) : getVCChartOptions(data, graphType);
    }, [data, graphType, isRuntime]);

    const Icon = graphType === "voltage" ? ThunderIcon : graphType === "current" ? MeterIcon : ClockIcon;
       return (
        <div className="relative bg-white border rounded-xl">
            <div className="flex items-center gap-2 px-4 py-2 justify-between items-center">
                <span className="flex flex-row  items-center  gap-1 capitalize text-sm "><Icon />{graphType}</span>
                <div>
                    {graphType === "runtime" && totalMotorRunOnTime && (
                        <div className="text-xs text-gray-600 font-medium">
                            Total  {isAdmin() ? "Device" : "Pump"}  On Time: <span className="text-green-600">{totalMotorRunOnTime}</span>
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                    Loading…
                </div>
            ) : !Array.isArray(data) || data.length === 0 ? (
                <div className="h-40 flex items-center justify-center">
                    No data
                </div>
            ) : (
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            )}
        </div>
    );
};
export default Graphs;
