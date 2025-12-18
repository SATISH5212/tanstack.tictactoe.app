import { FC } from "react";
import clsx from "clsx";

interface SignalIconProps {
  strength: number;
}

const DeviceSignalIcon: FC<SignalIconProps> = ({ strength }) => {
  const getColor = () => {
    if (strength >= 20 && strength <= 30) return "bg-blue-500";     // Excellent
    if (strength >= 15 && strength <= 19) return "bg-green-500";    // Good
    if (strength >= 10 && strength <= 14) return "bg-yellow-500";   // OK
    if (strength >= 2 && strength <= 9) return "bg-red-500";        // Marginal
    return "bg-gray-400";                                           // Invalid
  };

  const color = getColor();

 
  const level = Math.min(4, Math.ceil((strength / 30) * 4));

  return (
    <div className="flex items-end gap-[2px]">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={clsx(
            "w-[4px] rounded-sm transition-all",
            bar <= level ? color : "bg-gray-200"
          )}
          style={{ height: `${bar * 5}px` }}
        ></div>
      ))}
    </div>
  );
};

export default DeviceSignalIcon;
