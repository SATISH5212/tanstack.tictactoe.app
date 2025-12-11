import React from "react";

type DeleteAnimatedProps = {
  size?: number;
  className?: string;
};

const DeleteAnimated: React.FC<DeleteAnimatedProps> = ({
  size = 56,
  className = "",
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
        .da-pulse-bg {
          transform-origin: 32px 32px;
          animation: da-pulse 2.2s ease-out infinite;
        }

        @keyframes da-pulse {
          0% { opacity: 0.18; transform: scale(1); }
          40% { opacity: 0.32; transform: scale(1.06); }
          100% { opacity: 0.18; transform: scale(1); }
        }

        .da-bin-body {
          transform-origin: 32px 38px;
        }

        .da-bin-lid {
          transform-origin: 32px 20px;
          animation: da-lid-pop 2.2s ease-in-out infinite;
        }

        @keyframes da-lid-pop {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(-12deg) translateY(-1px); }
          35% { transform: rotate(4deg); }
          48% { transform: rotate(-4deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }

        .da-card {
          transform-origin: 26px 24px;
          animation: da-card-move 2.2s ease-in-out infinite;
        }

        @keyframes da-card-move {
          0% {
            opacity: 0;
            transform: translate(-10px, -10px) scale(0.9);
          }
          18% {
            opacity: 1;
            transform: translate(0px, -6px) scale(1);
          }
          45% {
            opacity: 1;
            transform: translate(8px, 0px) scale(1);
          }
          70% {
            opacity: 0.7;
            transform: translate(8px, 6px) scale(0.86);
          }
          100% {
            opacity: 0;
            transform: translate(8px, 10px) scale(0.8);
          }
        }

        .da-bit {
          opacity: 0;
          transform-origin: center;
          animation: da-bit-pop 2.2s ease-out infinite;
        }

        .da-bit:nth-of-type(1) {
          animation-delay: 0.55s;
        }
        .da-bit:nth-of-type(2) {
          animation-delay: 0.7s;
        }
        .da-bit:nth-of-type(3) {
          animation-delay: 0.82s;
        }

        @keyframes da-bit-pop {
          0% {
            opacity: 0;
            transform: translate(0, 4px) scale(0.5);
          }
          25% {
            opacity: 0.9;
            transform: translate(-4px, -4px) scale(0.9);
          }
          60% {
            opacity: 0.4;
            transform: translate(-6px, -10px) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translate(-8px, -14px) scale(1.1);
          }
        }
      `}</style>

      {/* Soft background ring */}
      <circle
        cx="32"
        cy="32"
        r="28"
        className="da-pulse-bg"
        fill="#fee2e2"
      />

      {/* Base shadow */}
      <ellipse cx="32" cy="46" rx="14" ry="4" fill="#fecaca" />

      {/* Generic "entity card" representing pond / motor / device / user */}
      <g className="da-card">
        <rect
          x="18"
          y="18"
          width="18"
          height="14"
          rx="3"
          fill="#e5f3ff"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />
        {/* Left icon circle */}
        <circle cx="23" cy="25" r="3" fill="#22c55e" />
        {/* Text lines */}
        <rect x="28" y="22" width="6" height="1.6" rx="0.8" fill="#94a3b8" />
        <rect x="28" y="25.5" width="7" height="1.6" rx="0.8" fill="#cbd5f5" />
        <rect x="28" y="29" width="4" height="1.4" rx="0.7" fill="#94a3b8" />
      </g>

      {/* Trash bin body */}
      <g className="da-bin-body">
        <rect
          x="24"
          y="24"
          width="16"
          height="22"
          rx="3"
          fill="#ef4444"
        />
        {/* vertical lines */}
        <rect x="28" y="27" width="1.4" height="16" rx="0.7" fill="#fecaca" />
        <rect x="32" y="27" width="1.4" height="16" rx="0.7" fill="#fecaca" />
        <rect x="36" y="27" width="1.4" height="16" rx="0.7" fill="#fecaca" />
      </g>

      {/* Lid */}
      <g className="da-bin-lid">
        <rect
          x="22"
          y="18"
          width="20"
          height="6"
          rx="2"
          fill="#b91c1c"
        />
        <rect
          x="28"
          y="16"
          width="8"
          height="2"
          rx="1"
          fill="#b91c1c"
        />
      </g>

      {/* "Data bits" flying out when card is deleted */}
      <circle
        className="da-bit"
        cx="39"
        cy="18"
        r="1.4"
        fill="#f97316"
      />
      <circle
        className="da-bit"
        cx="36"
        cy="16"
        r="1.1"
        fill="#facc15"
      />
      <circle
        className="da-bit"
        cx="42"
        cy="17"
        r="1.2"
        fill="#fb7185"
      />
    </svg>
  );
};

export default DeleteAnimated;
