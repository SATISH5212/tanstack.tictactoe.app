import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motorMakerIcon } from "@/lib/helpers/map/motorMarkerIcon";
import { IMotorMarkerTooltipProps } from "@/lib/interfaces/maps";
import { FC, useState } from "react";
import MotorInfoContent from "./MotorInfoContent";

const MotorMarkerTooltip: FC<IMotorMarkerTooltipProps> = ({
  motor,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);



  return (
    <TooltipProvider delayDuration={300}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <Tooltip open={isTooltipOpen && !isDropdownOpen} onOpenChange={setIsTooltipOpen}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="outline-none focus:outline-none hover:scale-110 transition-transform"
                onMouseEnter={() => setIsTooltipOpen(true)}
                onMouseLeave={() => setIsTooltipOpen(false)}
                onClick={() => {
                  setIsTooltipOpen(false);
                  setIsDropdownOpen(true);
                }}
              >
                {motorMakerIcon(motor)}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent side="top" className="p-0 border-0 shadow-lg bg-transparent">
            <MotorInfoContent motor={motor} />
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="p-0 border-0 shadow-lg bg-transparent"
          align="start"
          side="top"
          sideOffset={5}
        >
          <MotorInfoContent motor={motor} />
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default MotorMarkerTooltip;
