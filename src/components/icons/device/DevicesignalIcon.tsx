import { FC } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { getBarsFromCode, getSignalMeta } from "@/lib/helpers/getBarsFromCode";

interface SignalIconProps {
  strength: number;
}

const DeviceSignalIcon: FC<SignalIconProps> = ({ strength }) => {
  const bars = getBarsFromCode(strength);
  const { color, label } = getSignalMeta(strength);

  return (
    <div
      className="relative inline-block w-[26px] h-[22px]"
      title={`${label} (${strength})`}
    >
      <div className="absolute bottom-0 left-0 flex items-end gap-[1px]">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={clsx(
              "w-[4px] rounded-sm transition-all",
              bar <= bars ? color : "bg-gray-300"
            )}
            style={{ height: `${bar * 5}px` }}
          />
        ))}
      </div>

      {bars === 0 && (
        <X
          className="absolute top-0 left-2/4 -translate-x-1/2 w-4 h-4 text-red-500 animate-blink"
          strokeWidth={3}
        />
      )}
    </div>
  );
};

export default DeviceSignalIcon;
