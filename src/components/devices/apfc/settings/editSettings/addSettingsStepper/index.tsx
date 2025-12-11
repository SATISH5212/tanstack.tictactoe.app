import { Button } from "src/components/ui/button";
import { cn } from "src/lib/utils";
import { steppersConstansts } from "src/lib/constants/apfcSettingsConstants";
import { useLocation, useParams, useRouter } from "@tanstack/react-router";
import BackArrow from "src/components/icons/BackButton";
import { getSingleApfcDeviceAPI } from "src/lib/services/apfc";
import { useQuery } from "@tanstack/react-query";

type ArrowStepperType = {
  className?: string;
  selectedStep: "Level1" | "Level2" | "Level3" | "Level4";
  setSelectedStep: (step: "Level1" | "Level2" | "Level3" | "Level4") => void;
};
export interface ApfcDevice {
  id: number;
  device_serial_number: string;
  device_name: string;
  device_alias_name: string;
  status: "ACTIVE" | "INACTIVE";
  last_active_at: string;
  user_id: number | null;
  location: string;
  created_by: number;
  updated_by: number;
  cron_job_id: number;
  coordinates: number[];
  created_at: string;
  updated_at: string;
}

const ArrowSteppers = ({
  className,
  selectedStep,
  setSelectedStep,
}: ArrowStepperType) => {
  const router = useRouter();
  const { pathname } = useLocation();
  const { apfc_id } = useParams({ strict: false }) as {
    apfc_id: string;
    user_id: string;
  };
  const handleStepClick = (step: {
    title: string;
    label: "Level1" | "Level2" | "Level3" | "Level4";
  }) => {
    setSelectedStep(step.label);
    router.navigate({
      to: pathname,
      search: { state: step.label },
    });
  };
  const handleBack = () => {
    router.history.back();
  };
  const { data: apfcSingleDeviceData, error } = useQuery<ApfcDevice, Error>({
    queryKey: ["apfcSingleDevice", apfc_id],
    queryFn: async () => {
      const response = await getSingleApfcDeviceAPI(apfc_id);
      return response?.data?.data as ApfcDevice;
    },
    enabled: !!apfc_id,
    refetchOnWindowFocus: false,
  });
  return (
    <div className="mt-2">
      <div className="flex items-center gap-3 mb-4">
        <Button
          onClick={handleBack}
          className="bg-transparent hover:bg-transparent py-1 px-2 text-xs 3xl:text-sm h-fit border border-red-500 flex items-cetner gap-1 text-red-500"
        >
          <BackArrow className="w-5 h-5 text-red-500" />
          Back
        </Button>
        <h3 className="m-0 text-md 3xl:text-lg">
          {apfcSingleDeviceData?.device_name}
        </h3>
      </div>
      <div
        id="addSettingstepper"
        className={cn("flex items-center gap-4", className)}
      >
        {steppersConstansts?.map((step: any, index) => {
          const isActive = selectedStep === step.label;

          return (
            <Button
              key={index}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "min-w-28 !text-smd 3xl:text-base font-medium rounded-lg py-2 px-4 text-left justify-start",
                isActive
                  ? " text-green-500 border border-green-500 bg-white hover:bg-white"
                  : "border border-gray-300 text-gray-700 hover:bg-white"
              )}
              onClick={() => handleStepClick(step)}
            >
              {step.title}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ArrowSteppers;
