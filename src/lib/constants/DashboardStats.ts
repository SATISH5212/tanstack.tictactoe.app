import TestUsersIcon from "@/components/icons/dashboard/TestUsersIcon";
import TotalLocationsIcon from "@/components/icons/dashboard/TotalLocationIcon";
import TotalPondsIcon from "@/components/icons/dashboard/TotalPondsIcon";
import TotalDeviceIcon from "@/components/icons/dashboard/TotalDeviceIcon";
import TotalMotorIcon from "@/components/icons/dashboard/TotalMotorsIcon";

export const BaseStats = [
  {
    label: "Total Users",
    color: "p-2 space-y-2 bg-gray-200 w-full rounded-lg",
    icon: TestUsersIcon,
  },
  {
    label: "Total Locations",
    color: "p-2 space-y-2 bg-gray-200 w-full rounded-lg",
    icon: TotalLocationsIcon,
  },
  {
    label: "Total Devices",
    color: "p-2 space-y-2 bg-gray-200 w-full rounded-lg",
    icon: TotalDeviceIcon,
  },
  {
    label: "Total Motors",
    color: "p-2 space-y-2 bg-gray-200 w-full rounded-lg",
    icon: TotalMotorIcon,
  },
];
