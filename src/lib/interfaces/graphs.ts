export interface IGraphsProps {
    starterId: string;
    motorId: string;
    date?: { from?: Date; to?: Date };
    graphType: "runtime" | "voltage" | "current";
    rawDataGraphs: boolean;
};

export interface VCData {
    id: number;
    time_stamp: string;
    current_r: number;
    current_y: number;
    current_b: number;
    line_voltage_r: string;
    line_voltage_y: string;
    line_voltage_b: string;
}

export interface RunTimeData {
    id: number,
    start_time: string,
    end_time: string,
    duration: string,
    time_stamp: string,
    motor_state: number
}

