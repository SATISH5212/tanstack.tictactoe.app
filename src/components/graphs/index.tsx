import { getRuntimeChartOptions } from "@/lib/helpers/graphs/getRuntimeChartOptions";
import { getVCChartOptions } from "@/lib/helpers/graphs/getVCChartOptions";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FC, useMemo } from "react";
import { getRunTimeGraphAPI, getVoltageAndCurrentGraphAPI, } from "src/lib/services/deviceses";
import { ClockIcon } from "../svg/ClockIcon";
import { MeterIcon } from "../svg/MeterIcon";
import { ThunderIcon } from "../svg/ThunderIcon";

export interface IGraphsProps {
    starterId: string;
    motorId: string;
    date?: { from?: Date; to?: Date };
    graphType: "runtime" | "voltage" | "current";
    rawDataGraphs: boolean;
};

const Graphs: FC<IGraphsProps> = (props) => {
    const {
        starterId,
        motorId,
        date,
        graphType,
        rawDataGraphs, } = props

    if (rawDataGraphs && graphType === "runtime") { return null; }

    const queryParams = useMemo(() => ({
        from_date: date?.from
            ? dayjs(date.from).format("YYYY-MM-DD")
            : undefined,
        to_date: date?.to
            ? dayjs(date.to).format("YYYY-MM-DD")
            : undefined,
    }), [date]);

    const vcQuery = useQuery({
        enabled:
            (graphType === "voltage" || graphType === "current") &&
            !!starterId &&
            (!rawDataGraphs ? !!motorId : true),
        queryKey: [
            "vc-graph",
            graphType,
            starterId,
            rawDataGraphs ? "raw" : motorId,
            queryParams,
        ],
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
        enabled:
            !rawDataGraphs &&
            graphType === "runtime" &&
            !!starterId &&
            !!motorId,
        queryKey: ["runtime-graph", motorId, queryParams],
        queryFn: async () => {
            const res = await getRunTimeGraphAPI({
                starter_id: starterId,
                queryParams: { ...queryParams, motor_id: motorId },
            });
            return res?.data?.data ?? [];
        },
    });

    const data = graphType === "runtime" ? runtimeQuery.data : vcQuery.data;
    const isLoading = vcQuery.isLoading || runtimeQuery.isLoading;

    const chartOptions = useMemo(() => {
        if (graphType === "runtime") {
            return getRuntimeChartOptions(data);
        }
        return getVCChartOptions(data, graphType);
    }, [data, graphType]);

    return (
        <div className="relative bg-white border rounded-xl">
            <div className="flex items-center gap-2 px-4 py-2">
                {graphType === "voltage" ? (<ThunderIcon />) : graphType === "current" ? (<MeterIcon />) : (<ClockIcon />)}
                <span className="capitalize">{graphType}</span>
            </div>

            {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                    Loading…
                </div>
            ) : !data || (Array.isArray(data) && data.length === 0) ? (
                <div className="h-40 flex items-center justify-center">
                    No data
                </div>
            ) : (<HighchartsReact highcharts={Highcharts} options={chartOptions} />)}
        </div>
    );
};

export default Graphs;
