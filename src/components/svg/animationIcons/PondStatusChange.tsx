import React from "react";

type PondStatusAnimatedProps = {
  size?: number;
  className?: string;
  isActivating?: boolean; // true = activating (green), false = deactivating (red)
};

const PondStatusAnimated: React.FC<PondStatusAnimatedProps> = ({
  size = 56,
  className = "",
  isActivating = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>{`
        .ps-pulse-bg {
          transform-origin: 32px 32px;
          animation: ps-pulse 2.2s ease-out infinite;
        }

        @keyframes ps-pulse {
          0% { opacity: 0.18; transform: scale(1); }
          40% { opacity: 0.32; transform: scale(1.06); }
          100% { opacity: 0.18; transform: scale(1); }
        }

        .ps-pond {
          transform-origin: 32px 36px;
          animation: ps-pond-float 2.2s ease-in-out infinite;
        }

        @keyframes ps-pond-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        .ps-wave {
          transform-origin: 32px 38px;
          animation: ps-wave-ripple 2.2s ease-in-out infinite;
        }

        .ps-wave:nth-of-type(1) {
          animation-delay: 0s;
        }
        .ps-wave:nth-of-type(2) {
          animation-delay: 0.4s;
        }
        .ps-wave:nth-of-type(3) {
          animation-delay: 0.8s;
        }

        @keyframes ps-wave-ripple {
          0% {
            opacity: 0.8;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1.3);
          }
        }

        .ps-toggle-circle {
          transform-origin: 32px 18px;
          animation: ps-toggle-slide 2.2s ease-in-out infinite;
        }

        @keyframes ps-toggle-slide {
          0%, 100% { transform: translateX(${isActivating ? '6px' : '-6px'}); }
          50% { transform: translateX(${isActivating ? '-6px' : '6px'}); }
        }

        .ps-status-icon {
          transform-origin: 32px 36px;
          animation: ps-icon-pop 2.2s ease-in-out infinite;
        }

        @keyframes ps-icon-pop {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          35%, 65% { opacity: 1; transform: scale(1); }
        }

        .ps-particle {
          opacity: 0;
          transform-origin: center;
          animation: ps-particle-rise 2.2s ease-out infinite;
        }

        .ps-particle:nth-of-type(1) {
          animation-delay: 0.3s;
        }
        .ps-particle:nth-of-type(2) {
          animation-delay: 0.5s;
        }
        .ps-particle:nth-of-type(3) {
          animation-delay: 0.7s;
        }
        .ps-particle:nth-of-type(4) {
          animation-delay: 0.9s;
        }

        @keyframes ps-particle-rise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
          25% {
            opacity: 0.9;
            transform: translateY(-6px) scale(1);
          }
          60% {
            opacity: 0.4;
            transform: translateY(-14px) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.6);
          }
        }
      `}</style>

      {/* Soft background ring */}
      <circle
        cx="32"
        cy="32"
        r="28"
        className="ps-pulse-bg"
        fill={isActivating ? "#d1fae5" : "#fee2e2"}
      />

      {/* Base shadow */}
      <ellipse cx="32" cy="50" rx="16" ry="3" fill={isActivating ? "#a7f3d0" : "#fecaca"} opacity="0.5" />

      {/* Toggle switch background */}
      <g className="ps-toggle-track">
        <rect
          x="22"
          y="14"
          width="20"
          height="10"
          rx="5"
          fill={isActivating ? "#10b981" : "#ef4444"}
          opacity="0.3"
        />
        <rect
          x="22"
          y="14"
          width="20"
          height="10"
          rx="5"
          fill="none"
          stroke={isActivating ? "#059669" : "#dc2626"}
          strokeWidth="2"
        />
      </g>

      {/* Toggle circle */}
      <circle
        className="ps-toggle-circle"
        cx="32"
        cy="19"
        r="4"
        fill={isActivating ? "#10b981" : "#ef4444"}
      />

      {/* Pond body */}
      <g className="ps-pond">
        <ellipse
          cx="32"
          cy="38"
          rx="14"
          ry="10"
          fill={isActivating ? "#60a5fa" : "#94a3b8"}
          opacity="0.8"
        />
        <ellipse
          cx="32"
          cy="36"
          rx="14"
          ry="10"
          fill={isActivating ? "#3b82f6" : "#64748b"}
        />
      </g>

      {/* Water waves */}
      <ellipse
        className="ps-wave"
        cx="32"
        cy="36"
        rx="14"
        ry="10"
        fill="none"
        stroke={isActivating ? "#60a5fa" : "#94a3b8"}
        strokeWidth="1.5"
        opacity="0.6"
      />
      <ellipse
        className="ps-wave"
        cx="32"
        cy="36"
        rx="14"
        ry="10"
        fill="none"
        stroke={isActivating ? "#60a5fa" : "#94a3b8"}
        strokeWidth="1.5"
        opacity="0.6"
      />
      <ellipse
        className="ps-wave"
        cx="32"
        cy="36"
        rx="14"
        ry="10"
        fill="none"
        stroke={isActivating ? "#60a5fa" : "#94a3b8"}
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Status icon (checkmark for active, X for inactive) */}
      {isActivating ? (
        <g className="ps-status-icon">
          <path
            d="M 28 36 L 31 39 L 37 33"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <g className="ps-status-icon">
          <path
            d="M 28 33 L 36 39"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 36 33 L 28 39"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Particles rising from pond */}
      <circle
        className="ps-particle"
        cx="26"
        cy="40"
        r="1.2"
        fill={isActivating ? "#22c55e" : "#f87171"}
      />
      <circle
        className="ps-particle"
        cx="32"
        cy="42"
        r="1.4"
        fill={isActivating ? "#34d399" : "#fb923c"}
      />
      <circle
        className="ps-particle"
        cx="38"
        cy="40"
        r="1.1"
        fill={isActivating ? "#4ade80" : "#fca5a5"}
      />
      <circle
        className="ps-particle"
        cx="35"
        cy="41"
        r="1.3"
        fill={isActivating ? "#86efac" : "#fdba74"}
      />
    </svg>
  );
};

export default PondStatusAnimated;