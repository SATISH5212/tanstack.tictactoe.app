
export interface LiveMotorData {
    mtr_id: number;
    mode: number;
    amp: [number, number, number];
    mtr_sts: number;
    flt: number;
    alt: number;
    l_on: number;
    l_of: number;

}

// Main live data interface
export interface LatestLiveData {
    p_v: number;
    d_id: string;
    ll_v: [number, number, number];
    pwr: number;
    mtr: LiveMotorData[];
    t_s: string;
}


export interface MotorAck {
    d_id: string;
    mtr_1?: number;
    mtr_2?: number;
}

export interface LatestMotorAck {
    dev: MotorAck[];
}

export interface Device {
    ipv6: string | undefined;
    id: number;
    title: string;
    alias_starter_title?: string | null;
    serial_no: string;
    motors: {
        id: number;
        title: string;
        hp: string;
        state: number;
        motor_ref_id: string;
        pond: {
            id: number;
            title: string;
            location: {
                id: number;
                title: string;
            };
        };
    }[];
    gateways?: { title: string };
    capable_motors: any;
}