import { useCallback } from "react";
import mqtt from "mqtt";
import { toast } from "sonner";
import {
  DeviceSettings,
  DeviceSettingsData,
  DeviceSettingsLimits,
} from "src/lib/interfaces/core/settings";
import {
  calculateFlc,
  convertPercentageToValue,
  formatNumber,
} from "src/lib/helpers/deviceSettings";
import { validateSettings } from "./settingValidations";
import { UseMQTTPublisherProps } from "@/lib/interfaces/startertBoxSettings";


export const useMQTTPublisher = ({
  client,
  isConnected,
  deviceSettingsData,
  editedSettings,
  minMaxRangeData,
  gateway,
  gatewayData,
  isTestDevice,
  isGatewayTitle,
  userGatewayTitle,
  deviceId,
  sendSettings,
  setEditMode,
}: UseMQTTPublisherProps) => {
  const getMotorData = useCallback(() => {
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

  const buildPayload = useCallback(() => {
    const { m1, m2, m1Flc, m2Flc } = getMotorData();

    const payloadSettings = {
      sn: deviceSettingsData?.starterBox?.pcb_number,
      d_id: deviceSettingsData?.starterBox?.mac_address,
      flt_en: editedSettings?.flt_en ?? deviceSettingsData?.flt_en,
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
        (editedSettings.seed_time ?? deviceSettingsData?.seed_time ?? 0) * 1000
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
                editedSettings.motor_specific_limits?.[1]?.locked_router_fault,
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
                editedSettings.motor_specific_limits?.[1]?.locked_router_alert,
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

    return Object.fromEntries(
      Object.entries(payloadSettings).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );
  }, [editedSettings, deviceSettingsData, getMotorData]);

  const handlePublish = useCallback(async () => {
    if (!client || !isConnected) {
      toast.error("MQTT client not connected. Please check your connection.");
      return;
    }

    const { isValid, invalidFields } = validateSettings(
      editedSettings,
      minMaxRangeData
    );
    if (!isValid) {
      toast.error(
        `Invalid values in fields: ${invalidFields.join(", ")}. Please enter values within the allowed range.`
      );
      return;
    }

    try {
      const filteredPayload = buildPayload();
      const payloadString = JSON.stringify(filteredPayload, null, 2);
      const topic = `gateways/${isTestDevice ? gatewayData?.title : gateway || gatewayData?.title || isGatewayTitle || userGatewayTitle}/devices/config`;

      await client.publish(topic, payloadString, { qos: 0 }, (err: any) => {
        if (err) {
          toast.error(`Failed to publish settings: ${err.message}`);
          console.error("Publish error:", err);
        } else {
          if (deviceId) {
            sendSettings({
              deviceId: deviceId,
              payload: {
                ...editedSettings,
                is_new_configuration_saved: 0,
              } as DeviceSettings,
            });
          }
        }
      });
    } catch (err: any) {
      toast.error(`Error generating payload: ${err.message}`);
      console.error("Payload generation error:", err);
    } finally {
      setEditMode(false);
    }
  }, [
    client,
    isConnected,
    editedSettings,
    minMaxRangeData,
    buildPayload,
    gateway,
    gatewayData,
    isTestDevice,
    isGatewayTitle,
    userGatewayTitle,
    deviceId,
    sendSettings,
    setEditMode,
  ]);

  return { handlePublish };
};
