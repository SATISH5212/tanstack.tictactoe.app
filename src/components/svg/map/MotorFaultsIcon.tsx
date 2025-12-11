import React from "react";

export const MotorFaultsIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            viewBox="0 0 32 32"
            width="32"
            height="32"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <style>
                {`
        @keyframes pulseOuter {
          0%, 10% { transform: translate(16px, 16px) scale(0); }
          50%, 100% { transform: translate(16px, 16px) scale(1); }
        }
        @keyframes pulseInner {
          0%, 50% { transform: translate(16px, 16px) scale(0); }
          90%, 100% { transform: translate(16px, 16px) scale(1); }
        }
        @keyframes pulseCore {
          0% { transform: translate(16px, 16.7px) scale(0.65); }
          50% { transform: translate(16px, 16.7px) scale(1.15); }
          100% { transform: translate(16px, 16.7px) scale(0.65); }
        }
        .pulseOuter { animation: pulseOuter 1s linear infinite; transform-origin: center; }
        .pulseInner { animation: pulseInner 1s linear infinite; transform-origin: center; }
        .pulseCore { animation: pulseCore 1s linear infinite; transform-origin: center; }
      `}
            </style>

            {/* Base circle and border */}
            <rect width="32" height="32" rx="16" fill="#fff" />
            <rect
                x="0.5"
                y="0.5"
                width="31"
                height="31"
                rx="15.5"
                stroke="#d62728"
                strokeOpacity="0.8"
                fill="none"
            />

            {/* Motor shape */}
            <path
                d="M24.3436,15.7241l-1.9237-1.3123c-.1739-.1186-.4069-.1388-.6027-.0511-.1951.0869-.3188.2661-.3188.4622v.803h-.569v-.8116c0-.285-.2571-.5161-.5742-.5161h-1.1433v-1.9165c0-.2851-.2572-.5162-.5743-.5162h-1.7863v-.5477h.4809c.3171,0,.5743-.2312.5743-.5161s-.2572-.5161-.5743-.5161h-3.7103c-.3171,0-.5743.2311-.5743.5161s.2572.5161.5743.5161h.4812v.5477h-2.2203c-.3172,0-.5744.2311-.5744.5162v1.0073h-1.1216c-.31722,0-.57437.2311-.57437.5161v1.1806h-1.03589v-1.4643c0-.285-.25715-.516-.57431-.516s-.57425.231-.57425.516v5.3979c0,.285.25709.516.57431.516s.57431-.2311.57431-.516v-1.4643h1.03595v1.2102c0,.2851.25714.5161.57435.5161h1.4443l2.0262,2.2422c.1091.1207.2729.1907.4458.1907h6.2521c.3171,0,.5742-.2312.5742-.5161v-.6819h.5691v.6819c0,.2016.1305.3845.3342.4689.0768.0317.1588.0472.24.0472.1346,0,.2676-.0426.3739-.1243l1.9237-1.4815c.1273-.0982.2004-.2413.2004-.392v-3.5814c-.0001-.1611-.0842-.3133-.2272-.4109Z"
                fill="#d62728"
            />

            {/* Animated ripples */}
            <g className="pulseOuter">
                <ellipse rx="15.5" ry="15.5" opacity="0.15" fill="#de5253" />
            </g>
            <g className="pulseInner">
                <ellipse rx="15.5" ry="15.5" opacity="0.2" fill="#de5253" />
            </g>
            <g className="pulseCore">
                <g transform="translate(0,-9.3)">
                    <rect x="13" y="23" width="6" height="6" fill="none" />
                    <path
                        d="M16.6125,23.9999c-.0636-.1056-.1534-.1929-.2607-.2536s-.2285-.0925-.3518-.0925-.2444.0319-.3518.0925c-.1073.0607-.1971.148-.2607.2536l-1.97,3.2175c-.0661.1088-.102.2331-.1042.3604s.0296.2527.0919.3636.1531.2033.2629.2676c.1097.0643.2347.0983.3619.0984h3.94c.1272-.0001.2522-.0341.362-.0984s.2005-.1566.2628-.2676.094-.2364.0919-.3636-.0381-.2516-.1042-.3604l-1.97-3.2175Z"
                        fill="#fff"
                    />
                    <path
                        d="M16,26.6875c-.0495-.0006-.0968-.0206-.1319-.0556-.035-.0351-.055-.0824-.0556-.1319v-1.125c0-.0497.0198-.0974.0549-.1326s.0829-.0549.1326-.0549.0974.0198.1326.0549.0549.0829.0549.1326v1.125c-.0006.0495-.0206.0968-.0556.1319-.0351.035-.0824.055-.1319.0556Z"
                        fill="#d62728"
                    />
                    <circle cx="16" cy="27.125" r="0.25" fill="#d62728" />
                </g>
            </g>
        </svg>
    );
};

export default MotorFaultsIcon;
