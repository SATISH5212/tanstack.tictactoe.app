import { BaseStats } from "@/lib/constants/DashboardStats";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { getDashboardStatsAPI } from "@/lib/services/dashboard";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useQuery } from "@tanstack/react-query";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useMemo } from "react";
import CountUp from "react-countup";

const StatsList = () => {
  const { data } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await getDashboardStatsAPI();
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { isUser } = useUserDetails();

  const getStatValue = useCallback((label: string, data: any): number => {
    switch (label) {
      case "Total Users":
        return data?.users_count ?? 0;
      case "Total Locations":
        return data?.locations_count ?? 0;
      case "Total Ponds":
        return data?.ponds_count ?? 0;
      case "Total Devices":
        return data?.starterBoxes_count ?? 0;
      case "Total Motors":
        return data?.motors_count ?? 0;
      default:
        return 0;
    }
  }, []);

  const statsWithValues = useMemo(() => {
    const isOwner = isUser();
    return BaseStats.filter(
      (stat) => !isOwner || stat.label !== "Total Users"
    ).map((stat) => ({
      ...stat,
      value: getStatValue(stat.label, data),
    }));
  }, [
    isUser,
    getStatValue,
    data?.users_count,
    data?.locations_count,
    data?.ponds_count,
    data?.starterBoxes_count,
    data?.motors_count,
  ]);

  return (
    <div className="flex flex-row  gap-1.5">
      {statsWithValues.map((stat, index) => (
        <div
          key={index}
          className="bg-white/85 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 border border-white/20 hover:bg-white/90 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-1">
            <div className={`text-xs font-medium text-gray-700 mr-1`}>
              {stat.label}
            </div>
            <div>
              {stat.icon && <stat.icon className="w-4 h-4 text-gray-600" />}
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            <CountUp start={0} end={stat.value} duration={1.5} separator="," />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsList;
