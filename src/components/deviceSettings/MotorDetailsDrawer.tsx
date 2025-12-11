import { Sheet, SheetContent } from "src/components/ui/sheet";

import { X } from "lucide-react";
import { Button } from "../ui/button";
import DeviceGraphs from "../devices/DeviceGraphs";

export const MotorDetailsDrawer = ({
  isOpen,
  onClose,
  motor,
  testStarterData,
  deviceData,
  capableMotors,
  isDeployed,
  setTestStarterData,
  singleData,
  userMotorsData,
}: any) => {
  if (!motor) return null;

  return (
    <Sheet open={isOpen}>
      <SheetContent className="w-custom_700px min-w-custom_700px sm:w-custom_700px bg-white [&>button]:hidden px-0">
        <div className="flex justify-end px-7">
          <button>
            <X
              className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
              onClick={() => onClose()}
            />
          </button>
        </div>
        <DeviceGraphs
          motor={motor}
          testStarterData={testStarterData}
          deviceData={deviceData}
          capableMotors={capableMotors}
          isDeployed={isDeployed}
          setTestStarterData={setTestStarterData}
          singleData={singleData}
          userMotorsData={userMotorsData}
        />
      </SheetContent>
    </Sheet>
  );
};
