import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { WhiteMotorIcon } from "../svg/WhiteMotor";

export const EmptyMotorsGraph = ({
  device_id,
  pond_id,
  ipv6,
  capableMotors,
  motor_ref_id,
  device_name,
  motorCount,
}: any) => {
  const navigate = useNavigate();
  const { user_id } = useParams({ strict: false });

  const resolvedCapable = capableMotors || motorCount || 1;
  const motors = React.useMemo(() => {
    if (resolvedCapable === 1) {
      return [{ id: "mtr_1", title: "Motor 1 ", motor_ref_id: "mtr_1" }];
    } else if (resolvedCapable === 2) {
      return [
        { id: "mtr_1", title: "Motor 1 ", motor_ref_id: "mtr_1" },
        { id: "mtr_2", title: "Motor 2 ", motor_ref_id: "mtr_2" },
      ];
    }
    return [];
  }, [resolvedCapable]);
  const handleMotorSwitch = (motor: { id: string; motor_ref_id: string }) => {
    
    if (!location.pathname.includes("user")) {
      navigate({
        to: `/devices/${device_id}/motors/$motor_id`,
        params: { device_id, motor_id: motor.id },
        search: {
          motor_ref_id: motor.motor_ref_id,
          capable_motors: capableMotors,
        },
        replace: true,
      });
    }else{
      navigate({
        to: `/users/${user_id}/devices/${device_id}`,
        params: { device_id, motor_id: motor.id },
        search: {
          motor_ref_id: motor.motor_ref_id,
          capable_motors: resolvedCapable,
        },
        replace: true,
      });
    }
  };



  return (
    <div className="w-full px-6">
      <div className="flex gap-3 mb-4 2xl:text-xs lg:text-xs">
        {motors.map((motor) => (
          <div
            key={motor.id}
            className={`flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer ${
              motor_ref_id === motor.motor_ref_id
                ? "bg-green-50 border border-green-200"
                : "bg-gray-50 border border-gray-200"
            }`}
            onClick={() => handleMotorSwitch(motor)}
          >
          
           < WhiteMotorIcon/>
            <div className="text-xs font-medium text-gray-700">
              {motor.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
