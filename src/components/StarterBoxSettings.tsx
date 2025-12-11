import {
  calculateFlc,
  convertPercentageToValue,
  formatNumber,
} from "src/lib/helpers/deviceSettings";
import formatUstToIST from "src/lib/helpers/timeFormat";
import {
  DeviceSettings,
  DeviceSettingsData,
  DeviceSettingsLimits,
  ExtendedDeviceSettings,
  MotorSettings,
  SettingsHistoryQueryParams,
} from "src/lib/interfaces/core/settings";
import {
  getAllDeviceSettingsAPI,
  getDeviceSettingLogsAPI,
  getMinMaxRangeAPI,
  sendDeviceSettingsAPI,
} from "src/lib/services/deviceSettings";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader, X } from "lucide-react";
import mqtt from "mqtt";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import StarterBoxSettingsHistory from "./StarterBoxSettingsHistory";
import StarterBoxSettingsLimits from "./StarterBoxSettingsLimits";
import { SettingsSvg } from "./svg/SettingsSvg";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL!;
const publishWrite = 1;
const DEFAULT_MOTOR_LIMITS = [{}, {}];

const StarterBoxSettings = ({
  isOpen,
  onClose,
  hideTrigger = false,
  hideTriggerOne = false,
  setShowSettings,
  gateway,
  deviceId,
  gatewayData,
  isTestDevice,
  isGatewayTitle,
  userGatewayTitle,
}: any) => {
  const device_id2 = deviceId;
  const [open, setOpen] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [internalClose, setInternalClose] = useState(false);
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connectStatus, setConnectStatus] = useState<
    "Connected" | "Disconnected" | "Error"
  >("Disconnected");
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("device-settings");
  const [editMode, setEditMode] = useState(false);
  const [editedSettings, setEditedSettings] = useState<Partial<DeviceSettings>>(
    {}
  );
  const [apiCall, setApiCall] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("current_page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 15;
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
  });
  const enabled = !!device_id2;
  const queryClient = useQueryClient();
  const getClientId = useCallback(() => {
    const storedClientId = localStorage.getItem("mqtt_client_id");
    if (storedClientId) {
      return storedClientId;
    } else {
      const newClientId = `mqtt_react_${uuidv4()}`;
      localStorage.setItem("mqtt_client_id", newClientId);
      return newClientId;
    }
  }, []);

  const MQTT_OPTIONS = useMemo(
    () => ({
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
      clientId: getClientId(),
      keepalive: 60,
      reconnectPeriod: 1000,
      connectTimeout: 4000,
      clean: true,
    }),
    [getClientId]
  );
  const {
    data: deviceSettingsData,
    isFetching: isFetchingDeviceSettings,
    isLoading: isLoadingDeviceSettings,
  } = useQuery<DeviceSettingsData | null>({
    queryKey: ["device-Settings", device_id2],
    queryFn: async () => {
      if (!device_id2) return null;
      const response = await getAllDeviceSettingsAPI(device_id2 as string);
      setApiCall(true);
      return response.data?.data;
    },
    enabled: (open || isOpen) && !!device_id2,
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: false,
  });

  const { data: minMaxRangeData, refetch } =
    useQuery<DeviceSettingsLimits | null>({
      queryKey: ["min-max-range", device_id2],
      queryFn: async () => {
        if (!device_id2) return null;
        const response = await getMinMaxRangeAPI(device_id2);
        setApiCall(true);
        return response.data?.data;
      },
      enabled: (open || isOpen) && !!device_id2,
      refetchOnWindowFocus: false,
      staleTime: 0,
    });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["devices-settings-history", device_id2],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams: SettingsHistoryQueryParams = {
        starter_id: device_id2 ?? null,
        pageIndex: pageParam as number,
        pageSize: pageSizeParam,
      };

      const response = await getDeviceSettingLogsAPI(queryParams);
      const deviceSettinhgsHistory = response?.data?.data?.data || [];
      const pagination = response?.data?.data?.pagination || {
        current_page: pageParam,
        page_size: pageSizeParam,
        total_pages: 0,
        total_records: 0,
      };

      return {
        data: deviceSettinhgsHistory,
        pagination,
      };
    },
    enabled: enabled && apiCall,
    initialPageParam: 1,
    retry: false,
    staleTime: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      if (lastPage.pagination.current_page < lastPage.pagination.total_pages) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });

  const allRecords = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  useEffect(() => {
    if (deviceSettingsData) {
      setEditedSettings(deviceSettingsData);
    } else setEditedSettings({});
  }, [deviceSettingsData]);
  useEffect(() => {
    if (isOpen || open) {
      if (!client || connectStatus === "Disconnected") {
        const mqttClient = mqtt.connect(BROKER_URL, MQTT_OPTIONS);

        mqttClient.on("connect", () => {
          setIsConnected(true);
          setConnectStatus("Connected");
        });

        mqttClient.on("error", (err: any) => {
          console.error("MQTT Connection Error:", err);
          setConnectStatus("Error");
          setIsConnected(false);
        });

        mqttClient.on("close", () => {
          setConnectStatus("Disconnected");
          setIsConnected(false);
        });

        setClient(mqttClient);
      }
    } else {
      if (client) {
        client.end(true, () => {
          setConnectStatus("Disconnected");
          setIsConnected(false);
        });
      }
    }

    return () => {
      if (client) {
        client.end(true);
      }
    };
  }, [isOpen, open]);

  const motorData = useMemo(() => {
    const m1 =
      editedSettings.motor_specific_limits?.[0] ||
      deviceSettingsData?.motor_specific_limits?.[0] ||
      {};
    const m2 =
      editedSettings.motor_specific_limits?.[1] ||
      deviceSettingsData?.motor_specific_limits?.[1] ||
      {};
    const m1Hp = deviceSettingsData?.motor_specific_limits?.[0]?.hp || 1;
    const m2Hp = deviceSettingsData?.motor_specific_limits?.[1]?.hp || 1;
    const m1FlcEdited = parseFloat(m1.full_load_current?.toString() || "0");
    const m2FlcEdited = parseFloat(m2.full_load_current?.toString() || "0");
    return {
      m1,
      m2,
      m1Flc: calculateFlc(m1Hp, m1FlcEdited),
      m2Flc: calculateFlc(m2Hp, m2FlcEdited),
    };
  }, [editedSettings.motor_specific_limits, deviceSettingsData]);

  const getCurrentValue = useCallback(
    (key: keyof DeviceSettings) => {
      return editedSettings[key] ?? deviceSettingsData?.[key] ?? "-";
    },
    [editedSettings, deviceSettingsData]
  );

  const getMotorValue = useCallback(
    (motorIndex: number, key: keyof MotorSettings) => {
      const motorLimits = editedSettings.motor_specific_limits
        ? editedSettings.motor_specific_limits[motorIndex]
        : deviceSettingsData?.motor_specific_limits?.[motorIndex];
      return motorLimits?.[key] ?? "-";
    },
    [editedSettings, deviceSettingsData]
  );

  const handleDoubleClick = useCallback((field: string) => {
    setEditMode(true);
    setFocusedField(field);
  }, []);

  const handleInputChange = useCallback(
    (key: keyof ExtendedDeviceSettings, value: string | number) => {
      setEditedSettings((prev) => ({
        ...prev,
        [key]:
          key === "flt_en"
            ? typeof value === "number"
              ? value
              : parseFloat(value)
            : typeof value === "string" && !isNaN(parseFloat(value))
              ? parseFloat(value)
              : value,
      }));
    },
    [deviceSettingsData]
  );

  const handleMotorInputChange = useCallback(
    (motorIndex: number, key: keyof MotorSettings, value: string) => {
      const numValue = parseFloat(value);
      const newValue = isNaN(numValue) ? value : numValue;
      setEditedSettings((prev) => {
        const motorLimits = [
          ...(prev.motor_specific_limits || DEFAULT_MOTOR_LIMITS),
        ];
        motorLimits[motorIndex] = {
          ...motorLimits[motorIndex],
          [key]: newValue,
        };
        return { ...prev, motor_specific_limits: motorLimits };
      });
    },
    []
  );

  const renderEditableField = useCallback(
    (
      value: any,
      field: string,
      isMotorField = false,
      motorIndex?: number,
      motorKey?: keyof MotorSettings
    ) => {
      const validateInput = (
        input: string | number,
        field: string
      ): boolean => {
        if (input === "") return true;
        const numValue = typeof input === "string" ? parseFloat(input) : input;
        if (isNaN(numValue)) {
          console.warn(`Invalid input for ${field}: Not a number`);
          return false;
        }
        if (numValue < 0) {
          console.warn(`Negative values are not allowed for ${field}`);
          toast.error(`Negative values are not allowed for ${field}`);
          return false;
        }

        let fieldKey = field;
        if (field.startsWith("motor_")) {
          fieldKey = field.split("_").slice(2).join("_");
        }

        const minKey = `${fieldKey}_min` as keyof DeviceSettingsLimits;
        const maxKey = `${fieldKey}_max` as keyof DeviceSettingsLimits;
        const minValueRaw = minMaxRangeData?.[minKey];
        const maxValueRaw = minMaxRangeData?.[maxKey];

        let isValid = true;

        if (minValueRaw != null) {
          const minValue =
            typeof minValueRaw === "string"
              ? parseFloat(minValueRaw)
              : minValueRaw;
          if (isNaN(minValue)) {
            console.warn(`Invalid min value for ${fieldKey}`);
          } else if (numValue < minValue) {
            console.warn(
              `Value ${numValue} for ${fieldKey} is less than the minimum value [${minValue}]`
            );
            isValid = false;
          }
        } else {
          console.warn(`Min value not defined for ${fieldKey}`);
        }

        if (maxValueRaw != null) {
          const maxValue =
            typeof maxValueRaw === "string"
              ? parseFloat(maxValueRaw)
              : maxValueRaw;
          if (isNaN(maxValue)) {
            console.warn(`Invalid max value for ${fieldKey}`);
          } else if (numValue > maxValue) {
            console.warn(
              `Value ${numValue} for ${fieldKey} is greater than the maximum value [${maxValue}]`
            );
            isValid = false;
          }
        } else {
          console.warn(`Max value not defined for ${fieldKey}`);
        }

        return isValid;
      };
      const isValid = validateInput(value ?? "", field);
      if (!editMode) {
        return (
          <span
            onDoubleClick={() => handleDoubleClick(field)}
            className="cursor-pointer"
          >
            {value ?? "-"}
          </span>
        );
      }

      return (
        <Input
          type="number"
          value={value ?? ""}
          onWheel={(e) => e.currentTarget.blur()}
          onChange={(e) => {
            const newValue = e.target.value;

            if (isMotorField && motorIndex !== undefined && motorKey) {
              handleMotorInputChange(motorIndex, motorKey, newValue);
            } else {
              handleInputChange(field as keyof DeviceSettings, newValue);
            }
          }}
          onBlur={() => {
            if (value !== "" && !validateInput(value ?? "", field)) {
              if (isMotorField && motorIndex !== undefined && motorKey) {
                handleMotorInputChange(motorIndex, motorKey, value ?? "");
              } else {
                handleInputChange(field as keyof DeviceSettings, value ?? "");
              }
            }
          }}
          className={`border outline-none ring-0 focus:ring-0 focus-visible:ring-0 rounded px-2 py-1 h-7 w-20 text-sm placeholder:text-xs ${
            !isValid && value !== "" ? "border-red-500" : "border-gray-300"
          }`}
          autoFocus={focusedField === field}
          step="1"
          placeholder="Enter value"
        />
      );
    },
    [
      editMode,
      focusedField,
      handleDoubleClick,
      handleInputChange,
      handleMotorInputChange,
      minMaxRangeData,
    ]
  );
  const { mutate: sendSettings } = useMutation({
    mutationFn: ({
      deviceId,
      payload,
    }: {
      deviceId: string;
      payload: DeviceSettings;
    }) => sendDeviceSettingsAPI(deviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["device-Settings", device_id2],
      });
      queryClient.invalidateQueries({
        queryKey: ["devices-settings-history", device_id2],
      });
      toast.success("Settings saved successfully");
    },
    onError: (err) => {
      console.error("API update error:", err);
      toast.error("Failed to save settings");
    },
  });
  const validateSettings = (
    settings: Partial<DeviceSettings>,
    minMaxRangeData: DeviceSettingsLimits | null | undefined
  ): { isValid: boolean; invalidFields: string[] } => {
    const invalidFields: string[] = [];

    const topLevelFields = Object.keys(settings).filter(
      (field) =>
        field !== "motor_specific_limits" &&
        minMaxRangeData?.hasOwnProperty(`${field}_min`)
    );

    for (const field of topLevelFields) {
      const value = settings[field as keyof DeviceSettings];
      const minKey = `${field}_min` as keyof DeviceSettingsLimits;
      const maxKey = `${field}_max` as keyof DeviceSettingsLimits;
      const minValueRaw = minMaxRangeData?.[minKey];
      const maxValueRaw = minMaxRangeData?.[maxKey];

      if (minValueRaw == null || maxValueRaw == null) {
        continue;
      }
      const minValue =
        typeof minValueRaw === "string" ? parseFloat(minValueRaw) : minValueRaw;
      const maxValue =
        typeof maxValueRaw === "string" ? parseFloat(maxValueRaw) : maxValueRaw;

      if (isNaN(minValue) || isNaN(maxValue)) {
        continue;
      }

      if (value === undefined || Array.isArray(value)) {
        continue;
      }

      const numValue = typeof value === "string" ? parseFloat(value) : value;

      if (
        value !== "" &&
        (isNaN(numValue) || numValue < minValue || numValue > maxValue)
      ) {
        invalidFields.push(field);
      }
    }

    settings.motor_specific_limits?.forEach((motor, index) => {
      const motorFields = Object.keys(motor).filter((key) =>
        minMaxRangeData?.hasOwnProperty(`${key}_min`)
      );

      for (const field of motorFields) {
        const value = motor[field as keyof MotorSettings];
        const minKey = `${field}_min` as keyof DeviceSettingsLimits;
        const maxKey = `${field}_max` as keyof DeviceSettingsLimits;
        const minValueRaw = minMaxRangeData?.[minKey];
        const maxValueRaw = minMaxRangeData?.[maxKey];

        if (minValueRaw == null || maxValueRaw == null) {
          continue;
        }

        const minValue =
          typeof minValueRaw === "string"
            ? parseFloat(minValueRaw)
            : minValueRaw;
        const maxValue =
          typeof maxValueRaw === "string"
            ? parseFloat(maxValueRaw)
            : maxValueRaw;

        if (isNaN(minValue) || isNaN(maxValue)) {
          continue;
        }

        if (value === undefined) {
          continue;
        }

        const numValue = typeof value === "string" ? parseFloat(value) : value;

        if (
          value !== "" &&
          (isNaN(numValue) || numValue < minValue || numValue > maxValue)
        ) {
          invalidFields.push(`motor_${index + 1}.${field}`);
        }
      }
    });

    return {
      isValid: invalidFields.length === 0,
      invalidFields,
    };
  };
  const handlePublish = useCallback(async () => {
    if (!client || !isConnected) {
      toast.error("MQTT client not connected");
      return;
    }

    const { isValid, invalidFields } = validateSettings(
      editedSettings,
      minMaxRangeData
    );
    if (!isValid) {
      toast.error("Please enter values within the allowed range.");
      return;
    }
    try {
      const { m1, m2, m1Flc, m2Flc } = motorData;
      const payloadSettings = {
        sn: deviceSettingsData?.starterBox?.pcb_number,
        d_id: deviceSettingsData?.starterBox?.mac_address,
        flt_en: editedSettings?.flt_en || deviceSettingsData?.flt_en,
        n_mtr: deviceSettingsData?.capable_motors,

        ipf: formatNumber(
          editedSettings.input_phase_failure ??
            deviceSettingsData?.input_phase_failure
        ),
        lvf: formatNumber(
          editedSettings.low_voltage_fault ??
            deviceSettingsData?.low_voltage_fault
        ),
        hvf: formatNumber(
          editedSettings.high_voltage_fault ??
            deviceSettingsData?.high_voltage_fault
        ),
        vif: formatNumber(
          editedSettings.voltage_imbalance_fault ??
            deviceSettingsData?.voltage_imbalance_fault
        ),
        paminf: formatNumber(
          editedSettings.min_phase_angle_fault ??
            deviceSettingsData?.min_phase_angle_fault
        ),
        pamaxf: formatNumber(
          editedSettings.max_phase_angle_fault ??
            deviceSettingsData?.max_phase_angle_fault
        ),
        otf: formatNumber(
          editedSettings.over_temperature_fault ??
            deviceSettingsData?.over_temperature_fault
        ),
        ug_r: formatNumber(
          editedSettings.u_gain_r ?? deviceSettingsData?.u_gain_r
        ),
        ug_y: formatNumber(
          editedSettings.u_gain_y ?? deviceSettingsData?.u_gain_y
        ),
        ug_b: formatNumber(
          editedSettings.u_gain_b ?? deviceSettingsData?.u_gain_b
        ),
        ig_r: formatNumber(
          editedSettings.i_gain_r ?? deviceSettingsData?.i_gain_r
        ),
        ig_y: formatNumber(
          editedSettings.i_gain_y ?? deviceSettingsData?.i_gain_y
        ),
        ig_b: formatNumber(
          editedSettings.i_gain_b ?? deviceSettingsData?.i_gain_b
        ),
        am:
          editedSettings.current_multiplier ??
          deviceSettingsData?.current_multiplier,
        st: formatNumber(
          (editedSettings.seed_time ?? deviceSettingsData?.seed_time ?? 0) *
            1000
        ),
        sto: formatNumber(
          (editedSettings.start_timing_offset ??
            deviceSettingsData?.start_timing_offset ??
            0) * 1000
        ),
        pfa: formatNumber(
          editedSettings.phase_failure_alert ??
            deviceSettingsData?.phase_failure_alert
        ),
        lva: formatNumber(
          editedSettings.low_voltage_alert ??
            deviceSettingsData?.low_voltage_alert
        ),
        hva: formatNumber(
          editedSettings.high_voltage_alert ??
            deviceSettingsData?.high_voltage_alert
        ),
        via: formatNumber(
          editedSettings.voltage_imbalance_alert ??
            deviceSettingsData?.voltage_imbalance_alert
        ),
        pamina: formatNumber(
          editedSettings.min_phase_angle_alert ??
            deviceSettingsData?.min_phase_angle_alert
        ),
        pamaxa: formatNumber(
          editedSettings.max_phase_angle_alert ??
            deviceSettingsData?.max_phase_angle_alert
        ),
        ota: formatNumber(
          editedSettings.over_temperature_alert ??
            deviceSettingsData?.over_temperature_alert
        ),
        lvr: formatNumber(
          editedSettings.low_voltage_recovery ??
            deviceSettingsData?.low_voltage_recovery
        ),
        hvr: formatNumber(
          editedSettings.high_voltage_recovery ??
            deviceSettingsData?.high_voltage_recovery
        ),
        m1: {
          // motor_ref_id:
          //   editedSettings.motor_specific_limits?.[0]?.motor_ref_id ??
          //   m1.motor_ref_id ??
          //   "mtr_1",
          // hp: editedSettings.motor_specific_limits?.[0]?.hp ?? m1.hp ?? "5",
          // motor_title:
          //   editedSettings.motor_specific_limits?.[0]?.motor_title ??
          //   m1.motor_title ??
          //   "motor 93",
          flc: formatNumber(m1Flc),
          flt: {
            dr: formatNumber(
              convertPercentageToValue(
                editedSettings.motor_specific_limits?.[0]
                  ?.dry_run_protection_fault,
                m1Flc,
                m1.dry_run_protection_fault || 50
              )
            ),
            ol: formatNumber(
              convertPercentageToValue(
                editedSettings.motor_specific_limits?.[0]?.over_load_fault,
                m1Flc,
                m1.over_load_fault || 120
              )
            ),
            lr: formatNumber(
              convertPercentageToValue(
                editedSettings.motor_specific_limits?.[0]?.locked_router_fault,
                m1Flc,
                m1.locked_router_fault || 400
              )
            ),
            opf: formatNumber(
              editedSettings.opf1f ?? m1.output_phase_failure ?? 0.5
            ),
            ci: formatNumber(
              convertPercentageToValue(
                editedSettings.motor_specific_limits?.[0]
                  ?.current_imbalance_fault,
                m1Flc,
                m1.current_imbalance_fault || 30
              )
            ),
          },
          alt: {
            dr: formatNumber(
              convertPercentageToValue(
                editedSettings.motor_specific_limits?.[0]
                  ?.dry_run_protection_alert,
                m1Flc,
                m1.dry_run_protection_alert || 60
              )
            ),
            ol: formatNumber(
              convertPercentageToValue(
                editedSettings.motor_specific_limits?.[0]?.over_load_alert,
                m1Flc,
                m1.over_load_alert || 110
              )
            ),
            lr: formatNumber(
              convertPercentageToValue(
                editedSettings.motor_specific_limits?.[0]?.locked_router_alert,
                m1Flc,
                m1.locked_router_alert || 300
              )
            ),
            ci: formatNumber(
              convertPercentageToValue(
                editedSettings.motor_specific_limits?.[0]
                  ?.current_imbalance_alert,
                m1Flc,
                m1.current_imbalance_alert || 20
              )
            ),
          },
          rec: {
            ol: formatNumber(
              editedSettings.or1 ?? m1.over_load_recovery ?? m1Flc
            ),

            lr: formatNumber(
              editedSettings.lr1r ?? m1.locked_router_recovery ?? m1Flc
            ),
            ci: formatNumber(
              editedSettings.ci1r ?? m1.current_imbalance_recovery
            ),
          },
        },
        ...(deviceSettingsData?.capable_motors === 2 && {
          m2: {
            // motor_ref_id:
            //   editedSettings.motor_specific_limits?.[1]?.motor_ref_id ??
            //   m2.motor_ref_id ??
            //   "mtr_2",
            // hp: editedSettings.motor_specific_limits?.[1]?.hp ?? m2.hp ?? "5",
            // motor_title:
            //   editedSettings.motor_specific_limits?.[1]?.motor_title ??
            //   m2.motor_title ??
            //   "motor 94",
            flc: formatNumber(m2Flc),
            flt: {
              dr: formatNumber(
                convertPercentageToValue(
                  editedSettings.motor_specific_limits?.[1]
                    ?.dry_run_protection_fault,
                  m2Flc,
                  m2.dry_run_protection_fault || 50
                )
              ),
              ol: formatNumber(
                convertPercentageToValue(
                  editedSettings.motor_specific_limits?.[1]?.over_load_fault,
                  m2Flc,
                  m2.over_load_fault || 120
                )
              ),
              lr: formatNumber(
                convertPercentageToValue(
                  editedSettings.motor_specific_limits?.[1]
                    ?.locked_router_fault,
                  m2Flc,
                  m2.locked_router_fault || 400
                )
              ),
              opf: formatNumber(
                editedSettings.opf2f ?? m2.output_phase_failure ?? 0.5
              ),
              ci: formatNumber(
                convertPercentageToValue(
                  editedSettings.motor_specific_limits?.[1]
                    ?.current_imbalance_fault,
                  m2Flc,
                  m2.current_imbalance_fault || 30
                )
              ),
            },
            alt: {
              dr: formatNumber(
                convertPercentageToValue(
                  editedSettings.motor_specific_limits?.[1]
                    ?.dry_run_protection_alert,
                  m2Flc,
                  m2.dry_run_protection_alert || 60
                )
              ),
              ol: formatNumber(
                convertPercentageToValue(
                  editedSettings.motor_specific_limits?.[1]?.over_load_alert,
                  m2Flc,
                  m2.over_load_alert || 110
                )
              ),
              lr: formatNumber(
                convertPercentageToValue(
                  editedSettings.motor_specific_limits?.[1]
                    ?.locked_router_alert,
                  m2Flc,
                  m2.locked_router_alert || 300
                )
              ),
              ci: formatNumber(
                convertPercentageToValue(
                  editedSettings.motor_specific_limits?.[1]
                    ?.current_imbalance_alert,
                  m2Flc,
                  m2.current_imbalance_alert || 20
                )
              ),
            },
            rec: {
              ol: formatNumber(
                editedSettings.or2 ?? m2.over_load_recovery ?? m2Flc
              ),
              lr: formatNumber(
                editedSettings.lr2r ?? m2.locked_router_recovery ?? m2Flc
              ),
              ci: formatNumber(
                editedSettings.ci2r ?? m2.current_imbalance_recovery
              ),
            },
          },
        }),
      };

      const filteredPayload = Object.fromEntries(
        Object.entries(payloadSettings).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      );
      const payloadString = JSON.stringify(filteredPayload, null, 2);
      const topic = `gateways/${isTestDevice ? gatewayData?.title : gateway || gatewayData?.title || isGatewayTitle || userGatewayTitle}/devices/config`;

      await client.publish(topic, payloadString, { qos: 0 }, (err: any) => {
        if (err) {
          toast.error("Failed to publish settings");
          console.error("Publish error:", err);
        } else {
          if (device_id2) {
            sendSettings({
              deviceId: device_id2,
              payload: { ...editedSettings, is_new_configuration_saved: 0 },
            });
          }
        }
      });
    } catch (err) {
      toast.error("Error generating payload");
    } finally {
      setEditMode(false);
    }
  }, [
    client,
    isConnected,
    motorData,
    deviceSettingsData,
    editedSettings,
    publishWrite,
    gateway,
    device_id2,
    sendSettings,
  ]);
  const handleSheetOpenChange = useCallback(
    (state: boolean) => {
      setOpen(state);
      setInternalClose(false);
      setEditMode(false);
      if (state && device_id2) {
        queryClient.invalidateQueries({
          queryKey: ["device-Settings", device_id2],
        });
        queryClient.invalidateQueries({
          queryKey: ["min-max-range", device_id2],
        });
      }
    },
    [queryClient, device_id2] // Correct dependencies
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  const handleCancel = () => {
    setEditedSettings(deviceSettingsData ?? {});
    setEditMode(false);
  };
  return (
    <div>
      <Sheet open={isOpen || open} onOpenChange={handleSheetOpenChange}>
        {!hideTrigger && (
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-1 justify-start.5"
              onClick={() => {
                setOpen(true);
              }}
            >
              <SettingsSvg />
              <div className="text-title">Settings</div>
            </button>
          </SheetTrigger>
        )}

        <SheetContent className="bg-white min-w-full xl:min-w-custom_65per w-1/2 font-inter p-0 text-xs [&>button]:hidden overflow-auto">
          <SheetHeader className="flex flex-row items-center justify-between px-6 py-2 border-b sticky top-0 bg-white z-50 space-y-0 border">
            <h1 className="m-0 leading-tight text-sm 3xl:text-lg font-medium ">
              Settings
              <span className="font-medium text-green-500">{` ${deviceSettingsData?.starterBox?.title ? "(" + deviceSettingsData?.starterBox?.title + ")" : " "}`}</span>
            </h1>

            <Button
              variant="outline"
              className="text-center font-medium text-md  rounded-full text-red-400 hover:text-red-600 hover:bg-red-100 p-0 h-6 w-6 m-0"
              onClick={() => {
                setInternalClose(true);
                setOpen(false);
                setEditMode(false);
                setShowSettings && setShowSettings(false);
              }}
            >
              <X />
            </Button>
          </SheetHeader>
          {isFetchingDeviceSettings ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <div className="pb-10 pt-4">
              <div className="flex items-center gap-3 justify-end mb-4 pr-4">
                {allRecords.length > 0 && deviceSettingsData && (
                  <div
                    className={`py-1 px-4 rounded-full ${allRecords[0]?.is_new_configuration_saved === 1 ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <div className="text-xxs 3xl:text-smd text-black/70 font-medium ">
                      {formatUstToIST(allRecords[0]?.updated_at ?? "")}
                    </div>
                  </div>
                )}
                <StarterBoxSettingsLimits
                  deviceId={device_id2 as string}
                  hideTriggerOne={hideTriggerOne}
                  isLoading={isLoading}
                  minMaxRangeData={minMaxRangeData}
                  isFetching={isFetching}
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage}
                  fetchNextPage={fetchNextPage}
                  refetch={refetch}
                  setSettingsEditMode={setEditMode}
                />

                <StarterBoxSettingsHistory
                  hideTriggerOne={hideTriggerOne}
                  isLoading={isLoading}
                  allRecords={allRecords}
                  isFetching={isFetching}
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage}
                  fetchNextPage={fetchNextPage}
                  setEditMode={setEditMode}
                />
              </div>
              <Tabs
                className="w-full"
                value={activeTab}
                onValueChange={handleTabChange}
                defaultValue="device-settings"
              >
                <TabsList className="bg-transparent !shadow-none">
                  <TabsTrigger
                    value="device-settings"
                    className="text-sm font-semibold text-gray-600 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 px-4"
                  >
                    Device Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="motor-calibration"
                    className="text-sm font-semibold text-gray-600 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 px-4"
                  >
                    Motor Calibration Data
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="device-settings" className="mx-4">
                  <div className="p-4 border border-gray-200 rounded-md mt-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Motor Configuration
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow className=""></TableRow>
                        <TableRow className="bg-gray-100">
                          <TableHead className="text-black font-normal text-xs">
                            Parameter
                          </TableHead>
                          <TableHead className="text-black font-normal text-xs">
                            Motor 1
                          </TableHead>
                          {deviceSettingsData?.capable_motors === 2 && (
                            <TableHead className="text-black font-normal text-xs">
                              Motor 2
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            HP
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            <span>{getMotorValue(0, "hp") ?? "--"}</span>
                          </TableCell>
                          {deviceSettingsData?.capable_motors === 2 && (
                            <TableCell className="text-xs font-medium">
                              <span>{getMotorValue(1, "hp") ?? "--"}</span>
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            FLC
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.full_load_current_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-2">
                                <span>
                                  {renderEditableField(
                                    getMotorValue(0, "full_load_current"),
                                    `motor_0_full_load_current`,
                                    true,
                                    0,
                                    "full_load_current"
                                  )}
                                </span>
                                <span>A</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.full_load_current_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {deviceSettingsData?.capable_motors === 2 && (
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.full_load_current_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center gap-x-2">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(1, "full_load_current"),
                                      `motor_1_full_load_current`,
                                      true,
                                      1,
                                      "full_load_current"
                                    )}
                                  </span>
                                  <span>A</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.full_load_current_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="device-settings" className="mx-4">
                  <div className="p-4 border border-gray-200 rounded-md mt-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Timing Configuration
                    </h3>
                    <div className=" grid grid-cols-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs font-medium">
                          Auto Start Seed Time
                        </span>
                        <div>
                          {editMode && (
                            <div className="flex flex-col items-center">
                              {minMaxRangeData?.seed_time_min || "--"}
                              <div>Min</div>
                            </div>
                          )}
                        </div>
                        <span className="text-xs">
                          {renderEditableField(
                            getCurrentValue("seed_time"),
                            "seed_time"
                          )}
                          <span className="ml-1">sec</span>
                        </span>
                        {editMode && (
                          <div className="flex flex-col items-center">
                            {minMaxRangeData?.seed_time_max || "--"}
                            <div>Max</div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs font-medium">
                          Auto Start offset Time
                        </span>
                        <div>
                          {editMode && (
                            <div className="flex flex-col items-center">
                              {minMaxRangeData?.start_timing_offset_min || "--"}
                              <div>Min</div>
                            </div>
                          )}
                        </div>
                        <span className="text-xs">
                          {renderEditableField(
                            getCurrentValue("start_timing_offset"),
                            "start_timing_offset"
                          )}
                          <span className="ml-1">sec</span>
                        </span>
                        {editMode && (
                          <div className="flex flex-col items-center">
                            {minMaxRangeData?.start_timing_offset_max || "--"}
                            <div>Max</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="device-settings" className="mx-4">
                  <div className="p-4 border border-gray-200 rounded-md mt-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Device Settings
                    </h3>
                    <span className="text-xs text-gray-600">
                      Total Motors:{" "}
                      {deviceSettingsData?.motor_specific_limits?.length ?? 0}
                    </span>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead
                            rowSpan={2}
                            className="text-black font-normal text-xs"
                          >
                            Parameter
                          </TableHead>
                          <TableHead className="text-black font-normal text-xs">
                            Alert
                          </TableHead>
                          <TableHead className="text-black font-normal text-xs">
                            Fault
                          </TableHead>
                          <TableHead className="text-black font-normal text-xs">
                            Recovery
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Phase Failure */}
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            Phase Failure
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.phase_failure_alert_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("phase_failure_alert"),
                                    "phase_failure_alert"
                                  )}
                                </span>
                                <span>V</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.phase_failure_alert_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.input_phase_failure_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("input_phase_failure"),
                                    "input_phase_failure"
                                  )}
                                </span>
                                <span>V</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.input_phase_failure_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">-</TableCell>
                        </TableRow>

                        {/* Low Voltage */}
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            Low Voltage
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.low_voltage_alert_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("low_voltage_alert"),
                                    "low_voltage_alert"
                                  )}
                                </span>
                                <span>V</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.low_voltage_alert_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-x-1">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.low_voltage_fault_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("low_voltage_fault"),
                                    "low_voltage_fault"
                                  )}
                                </span>
                                <span>V</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.low_voltage_fault_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.low_voltage_recovery_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("low_voltage_recovery"),
                                    "low_voltage_recovery"
                                  )}
                                </span>
                                <span>V</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.low_voltage_recovery_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* High Voltage */}
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            High Voltage
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.high_voltage_alert_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("high_voltage_alert"),
                                    "high_voltage_alert"
                                  )}
                                </span>
                                <span>V</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.high_voltage_alert_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.high_voltage_fault_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("high_voltage_fault"),
                                    "high_voltage_fault"
                                  )}
                                </span>
                                <span>V</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.high_voltage_fault_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.high_voltage_recovery_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("high_voltage_recovery"),
                                    "high_voltage_recovery"
                                  )}
                                </span>
                                <span>V</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.high_voltage_recovery_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Voltage Imbalance */}
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            Voltage Imbalance
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.voltage_imbalance_alert_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("voltage_imbalance_alert"),
                                    "voltage_imbalance_alert"
                                  )}
                                </span>
                                <span>%</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.voltage_imbalance_alert_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.voltage_imbalance_fault_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("voltage_imbalance_fault"),
                                    "voltage_imbalance_fault"
                                  )}
                                </span>
                                <span>%</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.voltage_imbalance_fault_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">-</TableCell>
                        </TableRow>

                        {/* Minimum Phase Angle */}
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            Minimum Phase Angle
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center  ">
                                  {minMaxRangeData?.min_phase_angle_alert_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("min_phase_angle_alert"),
                                    "min_phase_angle_alert"
                                  )}
                                </span>
                                <span>°</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.min_phase_angle_alert_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.min_phase_angle_fault_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("min_phase_angle_fault"),
                                    "min_phase_angle_fault"
                                  )}
                                </span>
                                <span>°</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.min_phase_angle_fault_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">-</TableCell>
                        </TableRow>

                        {/* Maximum Phase Angle */}
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            Maximum Phase Angle
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.max_phase_angle_alert_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("max_phase_angle_alert"),
                                    "max_phase_angle_alert"
                                  )}
                                </span>
                                <span>°</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center gap-x-1">
                                  {minMaxRangeData?.max_phase_angle_alert_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.max_phase_angle_fault_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("max_phase_angle_fault"),
                                    "max_phase_angle_fault"
                                  )}
                                </span>
                                <span>°</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.max_phase_angle_fault_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">-</TableCell>
                        </TableRow>

                        {/* Over Temperature */}
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            Over Temperature
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.over_temperature_alert_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("over_temperature_alert"),
                                    "over_temperature_alert"
                                  )}
                                </span>
                                <span>°C</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.over_temperature_alert_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.over_temperature_fault_min ||
                                    "--"}
                                  <div>Min</div>
                                </div>
                              )}
                              <div className="flex items-center gap-x-1">
                                <span>
                                  {renderEditableField(
                                    getCurrentValue("over_temperature_fault"),
                                    "over_temperature_fault"
                                  )}
                                </span>
                                <span>°C</span>
                              </div>
                              {editMode && (
                                <div className="flex flex-col items-center">
                                  {minMaxRangeData?.over_temperature_fault_max ||
                                    "--"}
                                  <div>Max</div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">-</TableCell>
                        </TableRow>

                        {/* Fault Detection */}
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            Fault Detection
                          </TableCell>
                          <TableCell className="text-xs">-</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              {editMode ? (
                                <span className="flex items-center gap-4">
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="radio"
                                      name="flt_en"
                                      value={1}
                                      checked={getCurrentValue("flt_en") === 1}
                                      onChange={() =>
                                        handleInputChange("flt_en", 1)
                                      }
                                      className="cursor-pointer accent-green-500"
                                    />
                                    <span>Yes</span>
                                  </label>
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="radio"
                                      name="flt_en"
                                      value={0}
                                      checked={getCurrentValue("flt_en") === 0}
                                      onChange={() =>
                                        handleInputChange("flt_en", 0)
                                      }
                                      className="cursor-pointer accent-green-500"
                                    />
                                    <span>No</span>
                                  </label>
                                </span>
                              ) : (
                                <span
                                  onDoubleClick={() =>
                                    handleDoubleClick("flt_en")
                                  }
                                  className="cursor-pointer"
                                >
                                  {getCurrentValue("flt_en") === 1
                                    ? "Yes"
                                    : "No"}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">-</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent
                  value="device-settings"
                  className="mx-4 rounded-md overflow-hidden"
                >
                  <div className="p-4 border border-gray-200 rounded-md mt-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Motor Settings
                    </h3>
                    {deviceSettingsData &&
                    deviceSettingsData.motor_specific_limits &&
                    deviceSettingsData.motor_specific_limits.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead
                              rowSpan={2}
                              className="text-black font-normal text-xs"
                            >
                              Parameter
                            </TableHead>
                            <TableHead
                              colSpan={
                                deviceSettingsData?.capable_motors === 1 ? 1 : 2
                              }
                              className="text-black font-normal text-xs"
                            >
                              Alert
                            </TableHead>
                            <TableHead
                              colSpan={
                                deviceSettingsData?.capable_motors === 1 ? 1 : 2
                              }
                              className="text-black font-normal text-xs"
                            >
                              Fault
                            </TableHead>
                            <TableHead
                              colSpan={
                                deviceSettingsData?.capable_motors === 1 ? 1 : 2
                              }
                              className="text-black font-normal text-xs"
                            >
                              Recovery
                            </TableHead>
                          </TableRow>
                          <TableRow className="bg-gray-100">
                            <TableHead className="text-black font-normal text-xs">
                              Motor 1
                            </TableHead>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableHead className="text-black font-normal text-xs">
                                Motor 2
                              </TableHead>
                            )}
                            <TableHead className="text-black font-normal text-xs">
                              Motor 1
                            </TableHead>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableHead className="text-black font-normal text-xs">
                                Motor 2
                              </TableHead>
                            )}
                            <TableHead className="text-black font-normal text-xs">
                              Motor 1
                            </TableHead>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableHead className="text-black font-normal text-xs">
                                Motor 2
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium text-gray-600 text-xs">
                              Dry Run Protection
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.dry_run_protection_alert_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(
                                        0,
                                        "dry_run_protection_alert"
                                      ),
                                      `motor_0_dry_run_protection_alert`,
                                      true,
                                      0,
                                      "dry_run_protection_alert"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.dry_run_protection_alert_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.dry_run_protection_alert_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(
                                          1,
                                          "dry_run_protection_alert"
                                        ),
                                        `motor_1_dry_run_protection_alert`,
                                        true,
                                        1,
                                        "dry_run_protection_alert"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.dry_run_protection_alert_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.dry_run_protection_fault_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(
                                        0,
                                        "dry_run_protection_fault"
                                      ),
                                      `motor_0_dry_run_protection_fault`,
                                      true,
                                      0,
                                      "dry_run_protection_fault"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.dry_run_protection_fault_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.dry_run_protection_fault_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(
                                          1,
                                          "dry_run_protection_fault"
                                        ),
                                        `motor_1_dry_run_protection_fault`,
                                        true,
                                        1,
                                        "dry_run_protection_fault"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.dry_run_protection_fault_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">-</TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">-</TableCell>
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-gray-600 text-xs">
                              Over Load
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.over_load_alert_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(0, "over_load_alert"),
                                      `motor_0_over_load_alert`,
                                      true,
                                      0,
                                      "over_load_alert"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.over_load_alert_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.over_load_alert_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(1, "over_load_alert"),
                                        `motor_1_over_load_alert`,
                                        true,
                                        1,
                                        "over_load_alert"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.over_load_alert_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.over_load_fault_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(0, "over_load_fault"),
                                      `motor_0_over_load_fault`,
                                      true,
                                      0,
                                      "over_load_fault"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.over_load_fault_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.over_load_fault_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(1, "over_load_fault"),
                                        `motor_1_over_load_fault`,
                                        true,
                                        1,
                                        "over_load_fault"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.over_load_fault_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.over_load_recovery_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(0, "over_load_recovery"),
                                      `motor_0_over_load_recovery`,
                                      true,
                                      0,
                                      "over_load_recovery"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.over_load_recovery_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.over_load_recovery_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(1, "over_load_recovery"),
                                        `motor_1_over_load_recovery`,
                                        true,
                                        1,
                                        "over_load_recovery"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.over_load_recovery_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-gray-600 text-xs">
                              Locked Router
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.locked_router_alert_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(0, "locked_router_alert"),
                                      `motor_0_locked_router_alert`,
                                      true,
                                      0,
                                      "locked_router_alert"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.locked_router_alert_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.locked_router_alert_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(1, "locked_router_alert"),
                                        `motor_1_locked_router_alert`,
                                        true,
                                        1,
                                        "locked_router_alert"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.locked_router_alert_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.locked_router_fault_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(0, "locked_router_fault"),
                                      `motor_0_locked_router_fault`,
                                      true,
                                      0,
                                      "locked_router_fault"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.locked_router_fault_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.locked_router_fault_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(1, "locked_router_fault"),
                                        `motor_1_locked_router_fault`,
                                        true,
                                        1,
                                        "locked_router_fault"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.locked_router_fault_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.locked_router_recovery_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(
                                        0,
                                        "locked_router_recovery"
                                      ),
                                      `motor_0_locked_router_recovery`,
                                      true,
                                      0,
                                      "locked_router_recovery"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.locked_router_recovery_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.locked_router_recovery_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(
                                          1,
                                          "locked_router_recovery"
                                        ),
                                        `motor_1_locked_router_recovery`,
                                        true,
                                        1,
                                        "locked_router_recovery"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.locked_router_recovery_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-gray-600 text-xs">
                              Current Imbalance
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.current_imbalance_alert_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(
                                        0,
                                        "current_imbalance_alert"
                                      ),
                                      `motor_0_current_imbalance_alert`,
                                      true,
                                      0,
                                      "current_imbalance_alert"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.current_imbalance_alert_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.current_imbalance_alert_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(
                                          1,
                                          "current_imbalance_alert"
                                        ),
                                        `motor_1_current_imbalance_alert`,
                                        true,
                                        1,
                                        "current_imbalance_alert"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.current_imbalance_alert_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.current_imbalance_fault_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(
                                        0,
                                        "current_imbalance_fault"
                                      ),
                                      `motor_0_current_imbalance_fault`,
                                      true,
                                      0,
                                      "current_imbalance_fault"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.current_imbalance_fault_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.current_imbalance_fault_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(
                                          1,
                                          "current_imbalance_fault"
                                        ),
                                        `motor_1_current_imbalance_fault`,
                                        true,
                                        1,
                                        "current_imbalance_fault"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.current_imbalance_fault_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.current_imbalance_recovery_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(
                                        0,
                                        "current_imbalance_recovery"
                                      ),
                                      `motor_0_current_imbalance_recovery`,
                                      true,
                                      0,
                                      "current_imbalance_recovery"
                                    )}
                                  </span>
                                  <span>%</span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.current_imbalance_recovery_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.current_imbalance_recovery_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(
                                          1,
                                          "current_imbalance_recovery"
                                        ),
                                        `motor_1_current_imbalance_recovery`,
                                        true,
                                        1,
                                        "current_imbalance_recovery"
                                      )}
                                    </span>
                                    <span>%</span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.current_imbalance_recovery_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-gray-600 text-xs">
                              Output Phase Failure
                            </TableCell>
                            <TableCell className="text-xs">-</TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">-</TableCell>
                            )}
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.output_phase_failure_min ||
                                      "--"}
                                    <div>Min</div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span>
                                    {renderEditableField(
                                      getMotorValue(0, "output_phase_failure"),
                                      `motor_0_output_phase_failure`,
                                      true,
                                      0,
                                      "output_phase_failure"
                                    )}
                                  </span>
                                </div>
                                {editMode && (
                                  <div className="flex flex-col items-center">
                                    {minMaxRangeData?.output_phase_failure_max ||
                                      "--"}
                                    <div>Max</div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-2">
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.output_phase_failure_min ||
                                        "--"}
                                      <div>Min</div>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <span>
                                      {renderEditableField(
                                        getMotorValue(
                                          1,
                                          "output_phase_failure"
                                        ),
                                        `motor_1_output_phase_failure`,
                                        true,
                                        1,
                                        "output_phase_failure"
                                      )}
                                    </span>
                                  </div>
                                  {editMode && (
                                    <div className="flex flex-col items-center">
                                      {minMaxRangeData?.output_phase_failure_max ||
                                        "--"}
                                      <div>Max</div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="text-xs">-</TableCell>
                            {deviceSettingsData?.capable_motors === 2 && (
                              <TableCell className="text-xs">-</TableCell>
                            )}
                          </TableRow>
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-10">
                        <h3 className="text-lg font-semibold text-black">
                          No Data Available
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                          There are no motors data to display at the moment.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="motor-calibration">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="text-black font-normal text-xs">
                            Parameter
                          </TableHead>
                          {editMode && (
                            <TableHead className="text-black font-normal text-xs">
                              Min
                            </TableHead>
                          )}
                          <TableHead className="text-black font-normal text-xs ">
                            Value
                          </TableHead>
                          {editMode && (
                            <TableHead className="text-black font-normal text-xs">
                              Max
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            U Gain R for Atmel Calibration
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs ">
                              {minMaxRangeData?.u_gain_r_min || "--"}
                            </TableCell>
                          )}
                          <TableCell className="text-xs">
                            {renderEditableField(
                              getCurrentValue("u_gain_r"),
                              "u_gain_r"
                            )}
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.u_gain_r_max || "--"}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            U Gain Y for Atmel Calibration
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.u_gain_y_min || "--"}
                            </TableCell>
                          )}
                          <TableCell className="text-xs">
                            {renderEditableField(
                              getCurrentValue("u_gain_y"),
                              "u_gain_y"
                            )}
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.u_gain_y_max || "--"}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            U Gain B for Atmel Calibration
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.u_gain_b_min || "--"}
                            </TableCell>
                          )}
                          <TableCell className="text-xs">
                            {renderEditableField(
                              getCurrentValue("u_gain_b"),
                              "u_gain_b"
                            )}
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.u_gain_b_max || "--"}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            I Gain R for Atmel Calibration
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.i_gain_r_min || "--"}
                            </TableCell>
                          )}
                          <TableCell className="text-xs">
                            {renderEditableField(
                              getCurrentValue("i_gain_r"),
                              "i_gain_r"
                            )}
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.i_gain_r_max || "--"}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            I Gain Y for Atmel Calibration
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.i_gain_y_min || "--"}
                            </TableCell>
                          )}
                          <TableCell className="text-xs">
                            {renderEditableField(
                              getCurrentValue("i_gain_y"),
                              "i_gain_y"
                            )}
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.i_gain_y_max || "--"}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            I Gain B for Atmel Calibration
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.i_gain_b_min || "--"}
                            </TableCell>
                          )}
                          <TableCell className="text-xs">
                            {renderEditableField(
                              getCurrentValue("i_gain_b"),
                              "i_gain_b"
                            )}
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.i_gain_b_max || "--"}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-600 text-xs">
                            Current Sense ADC Multiplication Value
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.current_multiplier_min || "--"}
                            </TableCell>
                          )}
                          <TableCell className="text-xs">
                            {renderEditableField(
                              getCurrentValue("current_multiplier"),
                              "current_multiplier"
                            )}
                          </TableCell>
                          {editMode && (
                            <TableCell className="text-xs">
                              {minMaxRangeData?.current_multiplier_max || "--"}
                            </TableCell>
                          )}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
              {editMode && (
                <div className="flex justify-end gap-2 mt-3 px-4">
                  <Button
                    onClick={handlePublish}
                    className="bg-green-100 hover:bg-green-50 font-normal text-xs 3xl:text-sm  text-green-500 h-auto py-1.5 px-5 rounded-full"
                  >
                    Save
                  </Button>

                  <Button
                    onClick={handleCancel}
                    className="bg-red-100 hover:bg-red-50 font-normal text-xs 3xl:text-sm  text-red-500 h-auto py-1.5 px-5 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StarterBoxSettings;
