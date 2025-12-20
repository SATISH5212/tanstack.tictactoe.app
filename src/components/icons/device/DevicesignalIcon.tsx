import { FC } from "react";
import clsx from "clsx";
import { getBarsFromCode } from "@/lib/helpers/getBarsFromCode";

interface SignalIconProps {
  strength: number;
}

const DeviceSignalIcon: FC<SignalIconProps> = ({ strength }) => {
  const bars = getBarsFromCode(strength)
  return (
    <div className="flex items-end gap-[2px]">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={clsx(
            "w-[4px] rounded-sm transition-all",
            bar <= bars ? "bg-green-500" : "bg-gray-300"
          )}
          style={{ height: `${bar * 5}px` }}
        ></div>
      ))}
    </div>
  );
};

export default DeviceSignalIcon;
