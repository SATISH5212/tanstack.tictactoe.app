import { DropdownMenuItem } from "../ui/dropdown-menu";
import { MotorSvg } from "../svg/MotorSvg";
import ChartLineGraph from "../svg/ChartLineGraph";

interface ViewRawDataButtonProps {
  device: any;
  onOpenDrawer?: () => void;
}

const ViewRawDataButton = ({ device, onOpenDrawer }: ViewRawDataButtonProps) => {
  const handleViewRawData = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenDrawer) {
      onOpenDrawer();
    }
  };
  return (
    <DropdownMenuItem
      className="text-gray-500 cursor-pointer"
      onClick={handleViewRawData}
    >
      <ChartLineGraph />
      View Raw Data
    </DropdownMenuItem>
  );
};

export default ViewRawDataButton;