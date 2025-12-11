import React from "react";

export const ReplaceDeviceIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            id="Layer_1"
            height="32"
            viewBox="0 0 32 32"
            width="32"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g
                style={{
                    fill: "none",
                    stroke: "#000",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeMiterlimit: 10,
                    strokeWidth: 2,
                }}
            >
                <path d="m23 9h-12c-2.209 0-4 1.791-4 4v2" />
                <path d="m18 4 5 5-5 5" />
                <path d="m9 23h12c2.209 0 4-1.791 4-4v-2" />
                <path d="m14 28-5-5 5-5" />
            </g>
        </svg>
    );
};

export default ReplaceDeviceIcon;
