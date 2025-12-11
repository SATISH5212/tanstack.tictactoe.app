import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "src/components/ui/button";
import TotalKWCard from "./TotalKWCard";
import AvaragePFIcon from "src/components/icons/apfc/AvaragePf";
import TotalKWIcon from "src/components/icons/apfc/TotalKw";
import Temparature from "src/components/icons/apfc/Temparature";
import VoltageLNIicon from "src/components/icons/apfc/VoltageLn";
import VoltageLLIcon from "src/components/icons/apfc/VoltageLl";
import AverageCurrentIcon from "src/components/icons/apfc/AverageCurrent";
import AvarageKVAIcon from "src/components/icons/apfc/AvarageKva";
import TotalKVAIcon from "src/components/icons/apfc/TotalKva";
import VoltageMeasurementIcon from "src/components/icons/apfc/VoltageMeasurement";
import PowerMeasurementIcon from "src/components/icons/apfc/PowerMeasurement";
import { Card, CardContent, CardHeader } from "src/components/ui/card";
import ErrorsIcon from "src/components/icons/apfc/Errors";
import RelayStatusIcon from "src/components/icons/apfc/RelayStatus";
import BankValuesIcon from "src/components/icons/apfc/BankValues";
import DeviceDetailsIcon from "src/components/icons/apfc/DeviceDetaills";
import RefreshIcon from "src/components/icons/apfc/Refresh";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import {
  getSingleApfcDeviceDetailsAPI,
  updateSyncDeviceParamsAPI,
} from "src/lib/services/apfc";
import LoadingComponent from "src/components/core/Loading";

export interface DeviceData {
  id: number;
  device_id: number;
  voltage_v1n: number;
  voltage_v2n: number;
  voltage_v3n: number;
  voltage_v12: number;
  voltage_v23: number;
  voltage_v31: number;
  current_i1: number;
  current_i2: number;
  current_i3: number;
  average_voltage_ln: number;
  average_voltage_ll: number;
  average_current: number;
  frequency: number;
  kw1: number;
  kw2: number;
  kw3: number;
  kva1: number;
  kva2: number;
  kva3: number;
  kvar1: number;
  kvar2: number;
  kvar3: number;
  total_kw: number;
  total_kva: number;
  total_kvar: number;
  pf1: number;
  pf2: number;
  pf3: number;
  average_pf: number;
  kwh: number;
  kvah: number;
  kvarh: number;
  temperature: number;
  serial_number: string;
  slave_id: number;
  phase_compensation: number;
  no_voltage: number;
  over_voltage: number;
  under_voltage: number;
  thdi: number;
  over_compensation: number;
  under_compensation: number;
  step_error: number;
  ct_polarity_error: number;
  over_temperature: number;
  fan_settings: number;
  histeresis_voltage: number;
  histeresis_pf: number;
  relay1: number | null;
  relay2: number | null;
  relay3: number | null;
  relay4: number | null;
  relay5: number | null;
  relay6: number | null;
  relay7: number | null;
  relay8: number | null;
  relay9: number | null;
  relay10: number | null;
  relay11: number | null;
  relay12: number | null;
  relay13: number | null;
  relay14: number | null;
  bank1: number;
  bank2: number;
  bank3: number;
  bank4: number;
  bank5: number;
  bank6: number;
  bank7: number;
  bank8: number;
  bank9: number;
  bank10: number;
  bank11: number;
  bank12: number;
  bank13: number;
  bank14: number;
  hp: number;
  created_at: string;
  updated_at: string;
}

const ApfcDeviceDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const isDetailsActive = location.pathname.includes("/details");
  const isSettingsActive = location.pathname.includes("/settings");
  const isActivityActive = location.pathname.includes("/activity");
  const { apfc_id, user_id } = useParams({ strict: false }) as {
    apfc_id: string;
    user_id: string;
  };

  const { data, isLoading, refetch, error } = useQuery<DeviceData, Error>({
    queryKey: ["apfcDeviceData", apfc_id],
    queryFn: async () => {
      const response = await getSingleApfcDeviceDetailsAPI(apfc_id);
      return response.data.data as DeviceData;
    },
    enabled: !!apfc_id,
    refetchOnWindowFocus: false,
  });

  const updateSyncMutation = useMutation({
    mutationFn: () => updateSyncDeviceParamsAPI(apfc_id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["apfcDeviceData", apfc_id],
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const relayKeys = data
    ? (Object.keys(data)
        .filter((key) => /^relay\d+$/.test(key))
        .sort((a, b) => {
          const numA = parseInt(a.replace("relay", ""), 10);
          const numB = parseInt(b.replace("relay", ""), 10);
          return numA - numB;
        }) as (keyof DeviceData)[])
    : [];

  const bankKeys = data
    ? (Object.keys(data)
        .filter((key) => /^bank\d+$/.test(key))
        .sort((a, b) => {
          const numA = parseInt(a.replace("bank", ""), 10);
          const numB = parseInt(b.replace("bank", ""), 10);
          return numA - numB;
        }) as (keyof DeviceData)[])
    : [];

  return (
    <>
      <div
        className={`bg-white ${location.pathname.includes("/users") ? "p-0" : "p-4"}`}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Button
              className={`flex items-center gap-2 rounded-full h-auto py-2 px-4 text-teal-600 font-inter text-xs 3xl:text-sm font-medium ${
                isDetailsActive ? "bg-bfdfe3" : "bg-transparent"
              } hover:bg-bfdfe3`}
              onClick={() => navigate({ to: `/apfc/${apfc_id}/details` })}
            >
              <DeviceDetailsIcon className="size-6" />
              Device Details
            </Button>
            <Button
              className={`flex items-center gap-2 rounded-full h-auto py-2 px-4 text-teal-600 font-inter text-xs 3xl:text-sm font-medium ${
                isSettingsActive ? "bg-bfdfe3" : "bg-transparent"
              } hover:bg-bfdfe3`}
              onClick={() =>
                navigate({ to: `/apfc/${apfc_id}/settings?state=Level1` })
              }
            >
              <DeviceDetailsIcon className="size-6" />
              Device Settings
            </Button>
            <Button
              className={`flex items-center gap-2 rounded-full h-auto py-2 px-4 text-teal-600 font-inter text-xs 3xl:text-sm font-medium ${
                isActivityActive ? "bg-bfdfe3" : "bg-transparent"
              } hover:bg-bfdfe3`}
              onClick={() => navigate({ to: `/apfc/${apfc_id}/activity` })}
            >
              <DeviceDetailsIcon className="size-6" />
              Activity
            </Button>
          </div>
        </div>
        <div className="text-gray-500 flex items-center gap-4 justify-end mb-4">
          <span className="text-35353D text-xs 3xl:text-sm font-normal">
            Last sync:{" "}
            {data?.created_at && typeof data?.created_at === "string"
              ? new Date(data?.created_at)
                  .toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  ?.replace(/,/, "")
                  ?.replace(
                    /(\d+)\/(\d+)\/(\d+) (\d+:\d+) (AM|PM)/,
                    "$1-$2-$3 $4 $5"
                  )
                  .toLowerCase()
              : "--"}
          </span>
          <Button
            onClick={() => updateSyncMutation.mutate()}
            disabled={updateSyncMutation.isPending}
            className="rounded-lg bg-transparent hover:bg-transparent border border-gray-700 shadow-sm text-gray-700 font-inter text-xs 3xl:text-sm font-normal px-3 h-auto py-1 [&_svg]:size-3"
          >
            <RefreshIcon />
            {updateSyncMutation.isPending ? "Updating..." : "Update Sync"}
          </Button>
        </div>
        {isLoading ? (
          <div className="h-dashboard relative">
            <LoadingComponent loading={isLoading} message="Loading..." />
          </div>
        ) : (
          <div className="h-dashboard overflow-y-auto pe-1">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <TotalKWCard
                cardimage={<TotalKWIcon className="mb-2 size-5" />}
                mainDetails={["Total kW", data?.total_kw ?? "--"]}
                subDetails={{
                  kW1: data?.kw1 ?? "--",
                  kW2: data?.kw2 ?? "--",
                  kW3: data?.kw3 ?? "--",
                }}
              />
              <TotalKWCard
                cardimage={<AvaragePFIcon className="mb-2 size-5" />}
                mainDetails={["Average PF", data?.average_pf ?? "--"]}
                subDetails={{
                  PF1: data?.pf1 ?? "--",
                  PF2: data?.pf2 ?? "--",
                  PF3: data?.pf3 ?? "--",
                }}
              />
              <TotalKWCard
                cardimage={<Temparature className="mb-2 size-5" />}
                mainDetails={["Temperature", `${data?.temperature ?? "--"}°C`]}
                subDetails={["Frequency", data?.frequency ?? "--"]}
              />
            </div>
            <div className="mb-4">
              <p className="text-primary text-smd 3xl:text-base font-medium flex items-center gap-1 mb-2">
                <VoltageMeasurementIcon /> Voltage Measurements
              </p>
              <div className="grid grid-cols-3 gap-4">
                <TotalKWCard
                  cardimage={<VoltageLNIicon className="mb-2 size-5" />}
                  mainDetails={[
                    "Average Voltage LN",
                    `${data?.average_voltage_ln ?? "--"}V`,
                  ]}
                  subDetails={{
                    "Voltage V1N": `${data?.voltage_v1n ?? "--"}V`,
                    "Voltage V2N": `${data?.voltage_v2n ?? "--"}V`,
                    "Voltage V3N": `${data?.voltage_v3n ?? "--"}V`,
                  }}
                />
                <TotalKWCard
                  cardimage={<VoltageLLIcon className="mb-2 size-5" />}
                  mainDetails={[
                    "Average Voltage LL",
                    `${data?.average_voltage_ll ?? "--"}V`,
                  ]}
                  subDetails={{
                    "Voltage V12": `${data?.voltage_v12 ?? "--"}V`,
                    "Voltage V23": `${data?.voltage_v23 ?? "--"}V`,
                    "Voltage V31": `${data?.voltage_v31 ?? "--"}V`,
                  }}
                />
                <TotalKWCard
                  cardimage={<AverageCurrentIcon className="mb-2 size-5" />}
                  mainDetails={[
                    "Average Current",
                    `${data?.average_current ?? "--"}A`,
                  ]}
                  subDetails={{
                    "Current I1": `${data?.current_i1 ?? "--"}A`,
                    "Current I2": `${data?.current_i2 ?? "--"}A`,
                    "Current I3": `${data?.current_i3 ?? "--"}A`,
                  }}
                />
              </div>
            </div>
            <div className="mb-4">
              <p className="text-primary text-smd 3xl:text-base font-medium flex items-center gap-1 mb-2">
                <PowerMeasurementIcon /> Power Measurements
              </p>
              <div className="grid grid-cols-3 gap-4">
                <TotalKWCard
                  cardimage={<AvarageKVAIcon className="mb-2 size-5" />}
                  mainDetails={["Average kVA", data?.total_kva ?? "--"]}
                  subDetails={{
                    kVA1: data?.kva1 ?? "--",
                    kVA2: data?.kva2 ?? "--",
                    kVA3: data?.kva3 ?? "--",
                  }}
                />
                <TotalKWCard
                  cardimage={<TotalKVAIcon className="mb-2 size-5" />}
                  mainDetails={["Total kVar", data?.total_kvar ?? "--"]}
                  subDetails={{
                    kVar1: data?.kvar1 ?? "--",
                    kVar2: data?.kvar2 ?? "--",
                    kVar3: data?.kvar3 ?? "--",
                  }}
                />
                <Card className="shadow-none h-full p-0.5 bg-gradient-to-r from-red-500 to-green-500 rounded-lg ">
                  <div className="flex flex-col justify-center p-3 rounded-lg h-full bg-white">
                    <div className="row flex justify-between w-full mb-2">
                      <div className="text-xxs 3xl:text-xs font-normal text-black/70 flex items-center gap-1">
                        <PowerMeasurementIcon className="size-4" />{" "}
                        <span>kWh</span>
                      </div>
                      <div className="text-base 3xl:text-xl font-normal text-35353d leading-none">
                        {data?.kwh ?? "--"}
                      </div>
                    </div>
                    <div className="row flex justify-between w-full mb-2">
                      <div className="text-xxs 3xl:text-xs font-normal text-black/70 flex items-center gap-1">
                        <PowerMeasurementIcon className="size-4" />{" "}
                        <span>kVAh</span>
                      </div>
                      <div className="text-base 3xl:text-xl font-normal text-35353d leading-none">
                        {data?.kvah ?? "--"}
                      </div>
                    </div>
                    <div className="row flex justify-between w-full">
                      <div className="text-xxs 3xl:text-xs font-normal text-black/70 flex items-center gap-1">
                        <PowerMeasurementIcon className="size-4" />{" "}
                        <span>kVARh</span>
                      </div>
                      <div className="text-base 3xl:text-xl font-normal text-35353d leading-none">
                        {data?.kvarh ?? "--"}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <Card className="flex-1  bg-white rounded-lg border border-gray-200 mb-4 ">
              <CardHeader className="border-b border-gray-200 bg-E4F5E3 p-2 rounded-t-md">
                <div className="flex items-center gap-1.5">
                  <ErrorsIcon className="size-4" />
                  <span className="text-primary font-inter text-xs 3xl:text-sm font-medium">
                    Errors
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* <div className="bg-red-500/40 p-4 mb-4">
                  <p className="text-black font-inter text-xs 3xl:text-smd font-normal leading-relaxed">
                    Over Voltage Error detected. The voltage level has exceeded
                    the safe limit. Please check the system to prevent potential
                    damage.
                  </p>
                </div> */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-6 p-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-black/70 font-inter text-xs 3xl:text-smd font-normal">
                      No voltage error
                    </label>
                    <p className="text-35353d font-inter text-smd 3xl:text-base font-normal">
                      {data?.no_voltage === 1 ? "No error" : "Error"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black/70 font-inter text-xs 3xl:text-smd font-normal">
                      Under voltage error
                    </label>
                    <p className="text-35353d font-inter text-smd 3xl:text-base font-normal">
                      {data?.under_voltage === 1 ? "No error" : "Error"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black/70 font-inter text-xs 3xl:text-smd font-normal">
                      Over voltage error
                    </label>
                    <p className="text-35353d font-inter text-smd 3xl:text-base font-normal">
                      {data?.over_voltage === 1 ? "No error" : "Error"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black/70 font-inter text-xs 3xl:text-smd font-normal">
                      THID I error
                    </label>
                    <p className="text-35353d font-inter text-smd 3xl:text-base font-normal">
                      {data?.thdi === 1 ? "No error" : "Error"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black/70 font-inter text-xs 3xl:text-smd font-normal">
                      Temperature error
                    </label>
                    <p className="text-35353d font-inter text-smd 3xl:text-base font-normal">
                      {data?.over_temperature === 1 ? "No error" : "Error"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black/70 font-inter text-xs 3xl:text-smd font-normal">
                      Under compensate error
                    </label>
                    <p className="text-35353d font-inter text-smd 3xl:text-base font-normal">
                      {data?.under_compensation === 1 ? "No error" : "Error"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className=" rounded-lg border bg-white border-gray-200 mb-4">
              <CardHeader className="border-b border-gray-200 bg-E4F5E3 p-2 rounded-t-md">
                <div className="flex items-center gap-1.5">
                  <RelayStatusIcon className="size-4" />
                  <span className="text-primary font-inter text-xs 3xl:text-sm font-medium">
                    Relay Status
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-4 gap-x-2 gap-y-6 xl:grid-cols-3">
                {relayKeys.map((relayKey, index) => {
                  const relayStatus = data?.[relayKey];
                  return (
                    <div key={relayKey} className="flex flex-col gap-1">
                      <label className="text-black/70 font-inter text-xs 3xl:text-smd font-normal">
                        Relay {index + 1}
                      </label>
                      <p
                        className={`font-inter text-smd 3xl:text-base font-normal ${
                          relayStatus === 1 ? "text-primary" : "text-[#d94841]"
                        }`}
                      >
                        {relayStatus === 1 ? "ON" : "OFF"}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card className=" rounded-lg border bg-white border-gray-200">
              <CardHeader className="border-b border-gray-200 bg-E4F5E3 p-2 rounded-t-md">
                <div className="flex items-center gap-1.5">
                  <BankValuesIcon className="size-4" />
                  <span className="text-primary font-inter text-xs 3xl:text-sm font-medium">
                    Bank Values
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-4 gap-x-2 gap-y-6 xl:grid-cols-3">
                {bankKeys.map((bankKey, index) => {
                  const bankValue = data?.[bankKey] ?? 0;
                  return (
                    <div key={bankKey} className="flex flex-col gap-1">
                      <label className="text-black/70 font-inter text-xs 3xl:text-smd font-normal">
                        Bank {index + 1}:
                      </label>
                      <p className="text-35353d font-inter text-smd 3xl:text-base font-normal">
                        {bankValue}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default ApfcDeviceDetails;
