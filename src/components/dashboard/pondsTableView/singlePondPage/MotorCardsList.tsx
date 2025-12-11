import { IMotorCardsListProps } from "@/lib/interfaces/ponds";
import { X } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
const MotorCardsList: FC<IMotorCardsListProps> = (props) => {
    const {
        motors,
        selectedMotorIds,
        handleMotorToggle,
        setSelectedMotorIds,
    } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [visibleMotors, setVisibleMotors] = useState(motors);
    const [cardMotors, setCardMotors] = useState(motors);
    useEffect(() => {
        const calculate = () => {
            if (!containerRef.current) return;

            const width = containerRef.current.offsetWidth;
            let used = 0;
            let count = 0;
            const prioritizedMotors = [
                ...motors.filter((m) => m.starter_id),
                ...motors.filter((m) => !m.starter_id),
            ];
            for (let motor of prioritizedMotors) {
                const buttonWidth = Math.max(motor.title.length * 9 + 46, 150);

                if (used + buttonWidth < width) {
                    used += buttonWidth;
                    count++;
                } else break;
            }
            setVisibleMotors(prioritizedMotors.slice(0, count + 1)),
                setCardMotors(prioritizedMotors.slice(count + 1));
        };

        calculate();
        window.addEventListener("resize", calculate);
        return () => window.removeEventListener("resize", calculate);
    }, [motors]);

    useEffect(() => {
        const clickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) document.addEventListener("mousedown", clickOutside);
        return () => document.removeEventListener("mousedown", clickOutside);
    }, [dropdownOpen]);


    return (
        <div
            ref={containerRef}
            className="flex justify-end  items-center gap-1 w-full overflow-visible whitespace-nowrap "
        >
            {visibleMotors.map((motor) => {
                const isSelected = selectedMotorIds.includes(motor.id);
                const isDisabled = !motor.starter_id;

                return (
                    <button
                        key={motor.id}
                        disabled={isDisabled}
                        onClick={() => handleMotorToggle(motor.id)}
                        title={isDisabled ? "Motor is not connected to any device" : ""}
                        className={`truncate flex capitalize flex-row items-center px-2 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
      ${isDisabled
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : isSelected
                                    ? "bg-green-600 text-white border-green-700 shadow-lg -translate-y-0.5"
                                    : "bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {motor.title}

                        {isSelected && (
                            <X
                                className="h-3 w-3 text-white hover:text-gray-200 ml-1"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleMotorToggle(motor.id)
                                }}
                            />
                        )}
                    </button>
                )

            })}


            {cardMotors.length > 0 && (
                <div ref={dropdownRef} className="relative inline-block">
                    <button
                        onClick={() => setDropdownOpen((x) => !x)}
                        className="px-2 py-1  rounded-full bg-orange-100 border border-orange-200 text-sky-600 text-xs font-medium hover:bg-orange-300 transition-colors"
                    >
                        +{cardMotors.length} more
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 space-y-1  top-full mt-1 bg-white border border-gray-300 shadow-lg rounded-lg p-2  z-[48] max-h-64 overflow-y-auto">
                            {cardMotors.map((motor) => {
                                const isSelected = selectedMotorIds.includes(motor.id);
                                const isDisabled = !motor.starter_id;

                                return (
                                    <button
                                        key={motor.id}
                                        disabled={isDisabled}
                                        onClick={() => handleMotorToggle(motor.id)}
                                        title={isDisabled ? "Motor is not connected to any device" : ""}
                                        className={`flex flex-row  capitalize items-center px-2 py-1  rounded-full text-xs font-medium border truncate transition-colors
              ${isDisabled
                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                : isSelected
                                                    ? "bg-green-600 text-white border-green-700"
                                                    : "bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {motor.title}
                                        {isSelected && (
                                            <X
                                                className="h-3 w-3 text-white hover:text-gray-200 ml-1 "
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMotorToggle(motor.id);
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MotorCardsList