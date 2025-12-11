// components/icons/PondStatusAnimatedIcon.tsx
import { motion } from "framer-motion";

const PondStatusAnimatedIcon = ({ isActivating }: { isActivating: boolean }) => {
    return (
        <div className="w-40 h-24 flex items-center justify-center">
            <svg width="180" height="90" viewBox="0 0 180 90">

                {/* ======================================================
                        SMALLER CRANE (50% SCALE)
                   ====================================================== */}

                {/* Crane tracks */}
                <rect x="10" y="45" width="40" height="8" fill="#222" rx="3" />

                {/* Crane body */}
                <rect x="22" y="32" width="28" height="14" fill="#f7c400" rx="3" />

                {/* Window */}
                <rect x="26" y="35" width="10" height="7" fill="#9bd0ff" rx="2" />

                {/* Crane boom: now perfectly aligned toward pond */}
                <motion.line
                    x1="48"
                    y1="35"
                    x2="95"
                    y2="50"
                    stroke="#f7c400"
                    strokeWidth="5"
                    strokeLinecap="round"
                    animate={{
                        rotate: isActivating ? [-5, -12, -5] : [2, 15, 2]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ transformOrigin: "48px 35px" }}
                />

                {/* Crane bucket */}
                <motion.path
                    d="M92 48 L102 53 L98 62 L88 57 Z"
                    fill="#666"
                    animate={{
                        rotate: isActivating ? [-15, -5, -15] : [10, 25, 10],
                        x: isActivating ? [0, 1, 0] : [0, -2, 0],
                        y: isActivating ? [0, -1, 0] : [0, 2, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Particles falling directly INTO pond */}
                <motion.circle
                    cx="98"
                    cy="56"
                    r="3"
                    fill={isActivating ? "#4DB3FF" : "#8B5A2B"}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [1, 0],
                        y: [0, 20]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity
                    }}
                />

                {/* ======================================================
                          POND DIRECTLY UNDER BOOM (center-aligned)
                   ====================================================== */}

                {/* Pond outline */}
                <ellipse cx="125" cy="65" rx="35" ry="12" fill="#7b5a39" />

                {/* Animated water */}
                <motion.ellipse
                    cx="125"
                    cy="65"
                    rx="29"
                    ry="9.5"
                    fill="#4DB3FF"
                    initial={{ scaleY: 0 }}
                    animate={{
                        scaleY: isActivating ? [0, 1, 0] : [1, 0, 1]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ originY: "80%" }}
                />

                {/* Soil layer */}
                <motion.ellipse
                    cx="125"
                    cy="65"
                    rx="29"
                    ry="9.5"
                    fill="#8B5A2B"
                    initial={{ scaleY: 0 }}
                    animate={{
                        scaleY: isActivating ? [1, 0, 1] : [0, 1, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ originY: "80%" }}
                />

            </svg>
        </div>
    );
};

export default PondStatusAnimatedIcon;
