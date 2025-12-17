"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import mqtt from "mqtt";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Button } from "src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "src/components/ui/command";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "src/components/ui/sheet";
import {
  calculateFlc,
  convertPercentageToValue,
} from "src/lib/helpers/deviceSettings";
import { formatNumber } from "src/lib/helpers/formatNumber";
import {
  addDeviceAPI,
  getAllGateWays,
  getGatewayTitleAPI,
} from "src/lib/services/deviceses";
import { v4 as uuidv4 } from "uuid";

const AddDevice = ({ refetchDevices, gatewayId }: any) => {
  const queryClient = useQueryClient();
  // const { user_id } = useParams({ strict: false });
  const [isRefetching, setIsRefetching] = useState(false);
  const [gateways, setGateways] = useState<any[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [motorsOpen, setMotorsOpen] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectStatus, setConnectStatus] = useState<
    "Connected" | "Disconnected" | "Error"
  >("Disconnected");

  const [isMounted, setIsMounted] = useState(false);
  const isInitialMount = useRef(true);
  // const lastUserId = useRef(user_id);
  const initialDeviceData = useMemo(
    () => ({
      title: "",
      mcu_serial_no: "",
      mac_address: "",
      pcb_number: "",
      starter_number: "",
      // user_id: user_id ? Number(user_id) : null,
      gateway_id: "",
      capable_motors: null as number | null,
    }),
    []
  );

  const [deviceData, setDeviceData] = useState(initialDeviceData);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // useEffect(() => {
  //   if (lastUserId.current !== user_id) {
  //     lastUserId.current = user_id;
  //     setDeviceData(initialDeviceData);
  //     setGateways([]);
  //     setErrors({});
  //     if (!isInitialMount.current) {
  //       queryClient.invalidateQueries({
  //         queryKey: ["getAllgateways", user_id],
  //       });
  //     }
  //   }
  //   isInitialMount.current = false;
  // }, [user_id, initialDeviceData, queryClient]);
  // useEffect(() => {
  //   if (!isMounted) return;

  //   if (isOpen && !client && connectStatus === "Disconnected") {
  //     try {
  //       const mqttClient = mqtt.connect(BROKER_URL, MQTT_OPTIONS);
  //       mqttClient.on("connect", () => {
  //         setIsConnected(true);
  //         setConnectStatus("Connected");
  //       });
  //       mqttClient.on("error", (err: any) => {
  //         setConnectStatus("Error");
  //         setIsConnected(false);
  //         toast.error("MQTT connection failed");
  //       });
  //       mqttClient.on("close", () => {
  //         setConnectStatus("Disconnected");
  //         setIsConnected(false);
  //       });

  //       setClient(mqttClient);
  //     } catch (err) {
  //       toast.error("Failed to initialize MQTT client");
  //     }
  //   } else if (!isOpen && client) {
  //     client.end(true, () => {
  //       setConnectStatus("Disconnected");
  //       setIsConnected(false);
  //       setClient(null);
  //     });
  //   }

  //   return () => {
  //     if (client && !isOpen) {
  //       client.end(true);
  //     }
  //   };
  // }, [isOpen, client, connectStatus, isMounted]);

  const { data: gatewayTitleData, refetch: refetchGateway } = useQuery({
    queryKey: ["getgatewaytitle"],
    queryFn: async () => {
      const response = await getGatewayTitleAPI();
      return response.data?.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });


  const { mutateAsync: mutateAddDevice, isPending: isStatusPending } =
    useMutation({
      mutationKey: ["add-device"],
      retry: false,
      mutationFn: async (data: any) => {
        const response = await addDeviceAPI(data);
        return response;
      },
      onSuccess: useCallback(
        async (response: any) => {
          toast.success("Device Added Successfully");
          const settingsData = response?.data?.data;
          const gatewayTitle = settingsData?.gateway_title
            ? settingsData?.gateway_title
            : gatewayTitleData?.title;

          let retries = 0;
          const maxRetries = 3;
          while (!isConnected && retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries++;
          }

          if (client && isConnected) {
            try {
              const topic = `gateways/${gatewayTitle}/devices/config`;
              const motorLimits = settingsData?.motor_specific_limits || [];
              const m1Limits = motorLimits[0] || {};
              const m2Limits = motorLimits[1] || {};

              const m1Hp = m1Limits.hp || 1;
              const m2Hp = m2Limits.hp || 1;
              const m1FlcEdited = parseFloat(
                m1Limits.full_load_current?.toString() || "1.65"
              );
              const m2FlcEdited = parseFloat(
                m2Limits.full_load_current?.toString() || "1.65"
              );
              const m1Flc = calculateFlc(m1Hp, m1FlcEdited);
              const m2Flc = calculateFlc(m2Hp, m2FlcEdited);

              const m1 =
                Object.keys(m1Limits).length > 0
                  ? {
                      flc: formatNumber(m1Flc),
                      flt: {
                        dr: formatNumber(
                          convertPercentageToValue(
                            m1Limits.dry_run_protection_fault,
                            m1Flc,
                            50
                          )
                        ),
                        ol: formatNumber(
                          convertPercentageToValue(
                            m1Limits.over_load_fault,
                            m1Flc,
                            120
                          )
                        ),
                        lr: formatNumber(
                          convertPercentageToValue(
                            m1Limits.locked_router_fault,
                            m1Flc,
                            400
                          )
                        ),
                        opf: formatNumber(m1Limits.output_phase_failure ?? 0.5),
                        ci: formatNumber(
                          convertPercentageToValue(
                            m1Limits.current_imbalance_fault,
                            m1Flc,
                            30
                          )
                        ),
                      },
                      alt: {
                        dr: formatNumber(
                          convertPercentageToValue(
                            m1Limits.dry_run_protection_alert,
                            m1Flc,
                            60
                          )
                        ),
                        ol: formatNumber(
                          convertPercentageToValue(
                            m1Limits.over_load_alert,
                            m1Flc,
                            110
                          )
                        ),
                        lr: formatNumber(
                          convertPercentageToValue(
                            m1Limits.locked_router_alert,
                            m1Flc,
                            300
                          )
                        ),
                        ci: formatNumber(
                          convertPercentageToValue(
                            m1Limits.current_imbalance_alert,
                            m1Flc,
                            20
                          )
                        ),
                      },
                      rec: {
                        ol: formatNumber(m1Limits.over_load_recovery),
                        lr: formatNumber(m1Limits.locked_router_recovery),
                        ci: formatNumber(m1Limits.current_imbalance_recovery),
                      },
                    }
                  : undefined;

              const m2 =
                settingsData?.capable_motors === 2 &&
                motorLimits.length > 1 &&
                Object.keys(m2Limits).length > 0
                  ? {
                      flc: formatNumber(m2Flc),
                      flt: {
                        dr: formatNumber(
                          convertPercentageToValue(
                            m2Limits.dry_run_protection_fault,
                            m2Flc,
                            50
                          )
                        ),
                        ol: formatNumber(
                          convertPercentageToValue(
                            m2Limits.over_load_fault,
                            m2Flc,
                            120
                          )
                        ),
                        lr: formatNumber(
                          convertPercentageToValue(
                            m2Limits.locked_router_fault,
                            m2Flc,
                            400
                          )
                        ),
                        opf: formatNumber(m2Limits.output_phase_failure ?? 0.5),
                        ci: formatNumber(
                          convertPercentageToValue(
                            m2Limits.current_imbalance_fault,
                            m2Flc,
                            30
                          )
                        ),
                      },
                      alt: {
                        dr: formatNumber(
                          convertPercentageToValue(
                            m2Limits.dry_run_protection_alert,
                            m2Flc,
                            60
                          )
                        ),
                        ol: formatNumber(
                          convertPercentageToValue(
                            m2Limits.over_load_alert,
                            m2Flc,
                            110
                          )
                        ),
                        lr: formatNumber(
                          convertPercentageToValue(
                            m2Limits.locked_router_alert,
                            m2Flc,
                            300
                          )
                        ),
                        ci: formatNumber(
                          convertPercentageToValue(
                            m2Limits.current_imbalance_alert,
                            m2Flc,
                            20
                          )
                        ),
                      },
                      rec: {
                        ol: formatNumber(m2Limits.over_load_recovery),
                        lr: formatNumber(m2Limits.locked_router_recovery),
                        ci: formatNumber(m2Limits.current_imbalance_recovery),
                      },
                    }
                  : undefined;

              const payloadSettings = {
                sn: settingsData?.pcb_number,
                d_id: settingsData?.mac_address,
                n_mtr: settingsData?.capable_motors,
                flt_en: settingsData?.flt_en,
                ipf: formatNumber(settingsData?.input_phase_failure),
                lvf: formatNumber(settingsData?.low_voltage_fault),
                hvf: formatNumber(settingsData?.high_voltage_fault),
                vif: formatNumber(settingsData?.voltage_imbalance_fault),
                otf: formatNumber(settingsData?.over_temperature_fault),
                ug_r: formatNumber(settingsData?.u_gain_r),
                ug_y: formatNumber(settingsData?.u_gain_y),
                ug_b: formatNumber(settingsData?.u_gain_b),
                ig_r: formatNumber(settingsData?.i_gain_r),
                ig_y: formatNumber(settingsData?.i_gain_y),
                ig_b: formatNumber(settingsData?.i_gain_b),
                am: settingsData?.current_multiplier,
                st: formatNumber((settingsData?.seed_time ?? 0) * 1000),
                sto: formatNumber(
                  (settingsData?.start_timing_offset ?? 0) * 1000
                ),
                pfa: formatNumber(settingsData?.phase_failure_alert),
                lva: formatNumber(settingsData?.low_voltage_alert),
                hva: formatNumber(settingsData?.high_voltage_alert),
                via: formatNumber(settingsData?.voltage_imbalance_alert),
                ota: formatNumber(settingsData?.over_temperature_alert),
                lvr: formatNumber(settingsData?.low_voltage_recovery),
                hvr: formatNumber(settingsData?.high_voltage_recovery),
                paminf: formatNumber(settingsData.min_phase_angle_fault),
                pamaxf: formatNumber(settingsData.max_phase_angle_fault),
                pamina: formatNumber(settingsData.min_phase_angle_alert),
                pamaxa: formatNumber(settingsData.max_phase_angle_alert),
                ...(m1 && { m1 }),
                ...(m2 && { m2 }),
              };

              const filteredPayload = Object.fromEntries(
                Object.entries(payloadSettings).filter(
                  ([_, value]) => value !== undefined && value !== null
                )
              );
              const payloadString = JSON.stringify(filteredPayload, null, 2);

              // Uncomment if you want to publish MQTT message
              // await new Promise<void>((resolve, reject) => {
              //   client.publish(topic, payloadString, { qos: 1 }, (err) => {
              //     if (err) {
              //       console.error("MQTT Publish Error:", err);
              //       reject(err);
              //     } else {
              //       resolve();
              //     }
              //   });
              // });
            } catch (error: any) {
              console.error("MQTT Publish Error:", error);
              toast.error(`Failed to publish MQTT message: ${error.message}`);
            }
          } else {
            // toast.error("MQTT client not connected after retries");
            // console.error(
            //   "MQTT client not connected: client=",
            //   !!client,
            //   "isConnected=",
            //   isConnected
            // );
          }
          setDeviceData(initialDeviceData);
          setErrors({});
          setIsRefetching(true);
          if (window.location.pathname.startsWith("/devices")) {
            queryClient.invalidateQueries({ queryKey: ["devices"] });
          } else {
            queryClient.invalidateQueries({ queryKey: ["eachUserDevices"] });
          }

          setIsRefetching(false);
          setIsOpen(false);
        },
        [client, isConnected, gatewayTitleData, initialDeviceData, queryClient]
      ),

      onError: useCallback((error: any) => {
        if (error?.status === 409) {
          const errorMessage = error?.data?.message || "Device already exists";
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        } else if (error?.status === 422) {
          setErrors(error?.data?.errors || {});
        } else {
          toast.error(error?.data?.message);
        }
      }, []),
    });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const alphanumericFields = [
        "title",
        "mcu_serial_no",
        "pcb_number",
        "starter_number",
      ];
      let filteredValue = value;
      if (alphanumericFields.includes(name)) {
        filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
      }
      if (name === "title") {
        filteredValue = filteredValue.replace(/\s+/g, " ").trimStart();

        if (filteredValue.length > 0) {
          const isAllCaps = filteredValue === filteredValue.toUpperCase();

          if (isAllCaps) {
            filteredValue = filteredValue;
          } else {
            filteredValue =
              filteredValue.charAt(0).toUpperCase() + filteredValue.slice(1);
          }
        }
      }

      if (name === "mcu_serial_no" && filteredValue) {
        setErrors((prev: Record<string, string | null>) => ({
          ...prev,
          mcu_serial_no: null,
          mac_address: null,
        }));
      } else if (filteredValue && errors[name]) {
        setErrors((prev: Record<string, string | null>) => ({
          ...prev,
          [name]: null,
        }));
      }

      if (name === "mcu_serial_no") {
        const macAddress = filteredValue
          ? filteredValue.match(/.{1,2}/g)?.join(":") || ""
          : "";
        setDeviceData((prev) => ({
          ...prev,
          [name]: filteredValue,
          mac_address: macAddress,
        }));
      } else {
        setDeviceData((prev) => ({
          ...prev,
          [name]:
            name === "gateway_id" || name === "user_id"
              ? filteredValue
                ? Number(filteredValue)
                : null
              : filteredValue,
        }));
      }
    },
    [errors]
  );

  const handleMotorSelect = useCallback((motor: string) => {
    const motorNumber = Number(motor);
    setDeviceData((prev) => ({
      ...prev,
      capable_motors: prev.capable_motors === motorNumber ? null : motorNumber,
    }));
    setMotorsOpen(false);
    setErrors((prev: Record<string, string | null>) => ({
      ...prev,
      capable_motors: null,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const isDevicesRoute = window.location.pathname === `/devices`;
      const formattedData = {
        ...deviceData,
        title: deviceData.title,
        mcu_serial_no: deviceData.mcu_serial_no.toUpperCase(),
        mac_address: deviceData.mac_address.toUpperCase(),
        pcb_number: deviceData.pcb_number.toUpperCase(),
        starter_number: deviceData.starter_number
          ? deviceData.starter_number.toUpperCase()
          : null,
        capable_motors: deviceData.capable_motors,
        gateway_id: deviceData.gateway_id
          ? Number(deviceData.gateway_id)
          : gatewayId,
        // user_id: isDevicesRoute
        //   ? null
        //   : deviceData.user_id
        //     ? Number(user_id)
        //     : null,
      };
      await mutateAddDevice(formattedData);
    } catch (error) {
      console.error("Submit Error:", error);
    }
  }, [deviceData, gatewayId,mutateAddDevice]);

  const handleDrawerClose = useCallback(() => {
    setErrors({});
    setDeviceData(initialDeviceData);
    setIsOpen(false);
    setGateways([]);
  }, [initialDeviceData]);

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
    setGateways([]);
  }, []);

  const handleGatewaySelect = useCallback(
    (gatewayId: string) => {
      const isSame = deviceData.gateway_id === gatewayId;
      const newGatewayId = isSame ? "" : gatewayId;
      setDeviceData((prev) => ({
        ...prev,
        gateway_id: newGatewayId,
      }));
      if (errors?.gateway_id) {
        setErrors((prev: any) => ({ ...prev, gateway_id: undefined }));
      }
    },
    [deviceData.gateway_id, errors?.gateway_id]
  );

  const motorOptions = useMemo(() => ["1", "2"], []);

  return (
    // <ErrorBoundary>
    <div className="add-device-container">
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (open !== isOpen) {
            setIsOpen(open);
            if (!open) {
              handleDrawerClose();
            }
          }
        }}
      >
        <SheetTrigger asChild>
          <Button
            onClick={handleOpenModal}
            className="h-7 px-2 bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-1 text-white text-xs 3xl:text-sm cursor-pointer font-normal"
            disabled={isStatusPending}
          >
            <span>+ Add</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-white w-custom_40per sm:max-w-custom_30per min-w-custom_30per max-w-custom_30per px-6 py-0 font-inter [&>button]:hidden overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between pt-2">
              <SheetTitle className="font-inter text-black/80 font-normal text-md 3xl:text-lg">
                Add Device
              </SheetTitle>
              <button>
                <X
                  className="w-6 h-6 cursor-pointer text-red-500 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
                  onClick={() => handleDrawerClose()}
                />
              </button>
            </div>
          </SheetHeader>
          <div className="grid gap-4 pt-2 pb-12">
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                className="bg-gray-100 border-gray-200 shadow-none font-inter rounded-md focus-visible:ring-0 text-xs 3xl:text-md placeholder:font-inter placeholder:text-xs font-light"
                placeholder="Enter Title"
                id="title"
                name="title"
                value={deviceData.title}
                onChange={handleChange}
                maxLength={30}
              />
              {errors?.title && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.title}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                MCU Serial Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mcu_serial_no"
                placeholder="Enter MCU Serial Number "
                name="mcu_serial_no"
                value={deviceData.mcu_serial_no.toUpperCase()}
                onChange={handleChange}
                className="font-inter shadow-none border border-gray-200 bg-gray-100 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
              />
              {errors?.mcu_serial_no && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.mcu_serial_no}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                MAC Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mac_address"
                placeholder="Enter MAC Address"
                name="mac_address"
                value={deviceData.mac_address.toUpperCase() || ""}
                className="font-inter shadow-none border border-gray-300 bg-gray-200 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
                disabled
              />
              {errors?.mac_address && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.mac_address}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                PCB Number <span className="text-red-500">*</span>
              </Label>
              <Input
                className="shadow-none border border-gray-200 rounded-md bg-gray-100 font-inter focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
                placeholder="Enter PCB Number"
                id="pcb_number"
                name="pcb_number"
                value={deviceData.pcb_number.toUpperCase()}
                onChange={handleChange}
              />
              {errors?.pcb_number && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.pcb_number}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                Starter Box Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="starter_number"
                placeholder="Enter Starter Box Number"
                name="starter_number"
                value={deviceData.starter_number.toUpperCase()}
                onChange={handleChange}
                className="font-inter shadow-none border border-gray-200 bg-gray-100 focus-visible:ring-0 placeholder:font-inter placeholder:text-xs font-light"
              />
              {errors?.starter_number && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.starter_number}
                </span>
              )}
            </div>

    
            <div className="w-full space-y-1">
              <Label className="text-sm 3xl:text-base font-normal">
                Capable Motors <span className="text-red-500">*</span>
              </Label>
              <Popover open={motorsOpen} onOpenChange={setMotorsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    role="combobox"
                    aria-expanded={motorsOpen}
                    className="bg-transparent border px-2 py-2 h-fit w-full font-inter border-gray-200 text-black bg-gray-100 hover:bg-opacity-50 justify-between font-light"
                  >
                    {deviceData.capable_motors !== null ? (
                      <span className="text-xs">
                        {deviceData.capable_motors}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-inter">
                        Capable Motors
                      </span>
                    )}
                    <ChevronDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-custom_26dvh p-0">
                  <Command>
                    <CommandList className="font-inter">
                      <CommandEmpty>No motors available.</CommandEmpty>
                      <CommandGroup>
                        {motorOptions.map((motor) => (
                          <CommandItem
                            key={motor}
                            value={motor}
                            onSelect={() => {
                              handleMotorSelect(motor);
                            }}
                            className="hover:bg-gray-200"
                          >
                            <div>{motor}</div>
                            <Check
                              className={`ml-auto ${deviceData.capable_motors === Number(motor) ? "opacity-100" : "opacity-0"}`}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors?.capable_motors && (
                <span className="text-red-500 text-xs font-inter font-light mt-1">
                  {errors.capable_motors}
                </span>
              )}
            </div>
          </div>
          <SheetFooter className="py-2 w-full">
            <Button
              variant="outline"
              onClick={handleDrawerClose}
              className="text-center text-sm px-4 h-7 border border-gray-200 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="text-center flex justify-center text-sm text-white px-6 h-7 bg-blue-500 hover:bg-blue-600 font-medium"
              disabled={isStatusPending}
            >
              {isStatusPending ? <Loader2 className="animate-spin" /> : "Add"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
    // {/* </ErrorBoundary> */}
  );
};

export default AddDevice;
