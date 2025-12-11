// SingleApfcDeviceSettings.tsx
import { useQuery } from "@tanstack/react-query";
import {
  useLocation,
  useNavigate,
  useParams,
  useRouter
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import LoadingComponent from "src/components/core/Loading";
import DeviceDetailsIcon from "src/components/icons/apfc/DeviceDetaills";
import EditSettingsIcon from "src/components/icons/apfc/EditSettings";
import { Button } from "src/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import {
  getfanDeviceSettingsAPI,
  getLevel1DeviceSettingsAPI,
  getLevel2DeviceSettingsAPI,
  getLevel3DeviceSettingsAPI
} from "src/lib/services/apfc";
import Level1Settings from "./Level1Settings";
import Level2Settings from "./Level2Settings";
import Level3Settings from "./Level3Settings";
import Level4Settings from "./Level4Settings";


const SingleApfcDeviceSettings = () => {
  const [value, setValue] = useState("0");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { apfc_id: id, user_id } = useParams({ strict: false });
  const location = useLocation();
  const navigate = useNavigate();
  const isDetailsActive = location.pathname.includes("/details");
  const isSettingsActive = location.pathname.includes("/settings");
  const isActivityActive = location.pathname.includes("/activity")
  const searchParams = new URLSearchParams(location.search);
  const levelState = searchParams.get("state");

  const handleChange = (newValue: string) => {
    setValue(newValue);
    router.navigate({
      to: router.history.location.pathname,
      search: { state: `Level${parseInt(newValue) + 1}` },
    });
  };

  const { data: levelBasedData, isLoading, refetch } = useQuery({
    queryKey: ["deviceSettings", id, levelState],
    queryFn: async () => {
      switch (levelState) {
        case "Level1":
          return getLevel1DeviceSettingsAPI(id);
        case "Level2":
          return getLevel2DeviceSettingsAPI(id);
        case "Level3":
          return getLevel3DeviceSettingsAPI(id);
        case "Level4":
          return getfanDeviceSettingsAPI(id);
        default:
          return getLevel1DeviceSettingsAPI(id);
      }
    },
  });

  useEffect(() => {
    if (levelState) {
      const level = levelState?.replace("Level", "");
      setValue((parseInt(level || "1") - 1).toString());
    }
  }, [levelState]);
  const handleDetailsClick = () => {
    location.pathname.includes("/users")
      ? navigate({ to: `/users/${user_id}/apfc/${id}/details` })
      : navigate({ to: `/apfc/${id}/details` });
  };
  const handleSettingsClick = () => {
    location.pathname.includes("/users")
      ? navigate({ to: `/users/${user_id}/apfc/${id}/settings?state=Level1` })
      : navigate({ to: `/apfc/${id}/settings?state=Level1` });
  };
  const handleActivityClick = () => {
    location.pathname.includes("/users")
      ? navigate({ to: `/users/${user_id}/apfc/${id}/activity` })
      : navigate({ to: `/apfc/${id}/activity` });
  };
  const getLevelLabel = (tabValue: string) => {
    const levels = ["Level1", "Level2", "Level3", "Level4"];
    return levels[parseInt(tabValue)] || "Level1";
  };

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return (
    <>
      <div
        className={`${location.pathname.includes("/users") ? "p-0" : "p-4"}`}
      >
        <div className="flex justify-between items-center ">
          <div className="flex items-center gap-2">
            <Button
              className={`flex items-center gap-2 rounded-full h-auto py-2 px-4 text-teal-600 font-inter text-xs 3xl:text-sm font-medium ${isDetailsActive ? "bg-bfdfe3" : "bg-transparent"
                } hover:bg-bfdfe3`}
              onClick={handleDetailsClick}
            >
              <DeviceDetailsIcon className="size-4" />
              Device Details
            </Button>
            <Button
              className={`flex items-center gap-2 rounded-full h-auto py-2 px-4 text-teal-600 font-inter text-xs 3xl:text-sm font-medium ${isSettingsActive ? "bg-bfdfe3" : "bg-transparent"
                } hover:bg-bfdfe3`}
              onClick={handleSettingsClick}
            >
              <DeviceDetailsIcon className="size-6" />
              Device Settings
            </Button>
            <Button
              className={`flex items-center gap-2 rounded-full h-auto py-2 px-4 text-teal-600 font-inter text-xs 3xl:text-sm font-medium ${isActivityActive ? "bg-bfdfe3" : "bg-transparent"
                } hover:bg-bfdfe3`}
              onClick={handleActivityClick}

            >
              <DeviceDetailsIcon className="size-6" />
              Activity
            </Button>
          </div>
        </div>

        <div className="w-full  mx-auto  pt-4">
          <div className="flex items-start justify-between">

            <Tabs value={value} onValueChange={handleChange} className="w-fit">
              <TabsList className="border-none  bg-transparent">
                {["Level 1", "Level 2", "Level 3", "Fan Settings"].map(
                  (label, idx) => (
                    <TabsTrigger
                      key={idx}
                      value={idx.toString()}
                      className="px-4 py-2 text-smd 3xl:text-md font-normal text-gray-900 data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500"
                    >
                      {label}
                    </TabsTrigger>
                  )
                )}
              </TabsList>
            </Tabs>
            <Button
              className={`flex items-center gap-2 rounded-lg  py-1 h-auto px-3 bg-transparent hover:bg-transparent border border-red-500  text-red-500 font-inter text-xs 3xl:text-sm font-medium`}
              onClick={() => navigate({ to: `/apfc/${id}/update-settings?state=${getLevelLabel(value)}` })}
            >
              <EditSettingsIcon className="size-6" />
              Edit
            </Button>
          </div>
          {isLoading ?
            <div className='h-dashboard relative'>
              <LoadingComponent loading={isLoading} message="Loading..." />
            </div>
            :
            <div className="mt-4 h-apfc_devices overflow-y-auto">
              {value === "0" && (
                <Level1Settings
                  levelBasedData={levelBasedData?.data?.data || {}}
                  apfc_id={id || '1'}
                  openDialog={openDialog}
                  closeDialog={closeDialog}
                  open={open}
                  refetchLevel1Data={refetch}
                />
              )}
              {value === "1" && (
                <Level2Settings levelBasedData={levelBasedData?.data?.data || {}} />
              )}
              {value === "2" && (
                <Level3Settings levelBasedData={levelBasedData?.data?.data || {}} />
              )}
              {value === "3" && (
                <Level4Settings levelBasedData={levelBasedData?.data?.data || {}} />
              )}
            </div>
          }
          <Toaster richColors closeButton position="top-right" />
        </div>
      </div>
    </>
  );
};

export default SingleApfcDeviceSettings;
