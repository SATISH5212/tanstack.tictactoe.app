import React, { useEffect, useState } from "react";
import MotorIcon from "../svg/MotorIcon";
import PondsIcon from "../svg/map/PondsIcon";
import { DevicesSvg } from "../svg/DevicesSvg";
import { GatewayIcon } from "../svg/GatewayIcon";

const loadingSteps = [
    "Loading Ponds...",
    "Loading Motors...",
    "Loading Devices...",
];

const MapLoader: React.FC = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % loadingSteps.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[9999]">
            <div className="relative w-56 h-56">
                <div className="absolute inset-0 rounded-full border-4 border-blue-300/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-4 border-green-400/20 animate-ping"></div>
                <div className="absolute inset-4 rounded-full border-2 border-blue-400/20 animate-ping"></div>

                <div className="absolute inset-1 rounded-full border-2 border-yellow-400/30 animate-[rotateOrbit_10s_linear_infinite]"></div>
                <img
                    src="/PeepulAgriLogo.svg"
                    alt="Logo"
                    className="absolute inset-0 m-auto w-40 h-40 p-2"
                />
                <div className="absolute inset-0 animate-[rotateOrbit_6s_linear_infinite] m-7">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 
                        animate-[iconGlow_2.5s_ease-in-out_infinite]">
                        <MotorIcon size={32} color="#c3d9ddff" />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 
                        animate-[iconGlow_3s_ease-in-out_infinite]">
                        <PondsIcon width={32} height={32} color="#4ADE80" />
                    </div>


                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 
                        animate-[iconGlow_2.2s_ease-in-out_infinite]">
                        <DevicesSvg className="w-8 h-8 text-orange-300" />
                    </div>

                    <div className="absolute top-1/2 -left-4 -translate-y-1/2 
                        animate-[iconGlow_3.4s_ease-in-out_infinite]">
                        <GatewayIcon className="h-8 w-8 " color="#ec6e6eff" />
                    </div>
                </div>
            </div>
            <p className="mt-6 text-green-300 text-lg font-semibold animate-[fadeSwitch_1.2s_ease-in-out]">
                {loadingSteps[step]}
            </p>
        </div>
    );
};

export default MapLoader;
