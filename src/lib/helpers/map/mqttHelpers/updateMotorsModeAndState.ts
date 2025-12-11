import { Motor, Pond } from "@/lib/interfaces/maps/ponds";
import { LatestLiveData, LatestMotorAck } from "@/lib/interfaces/mqtt/motor";
import { getModeString } from "./motorModeConversion";

export const updateMotorsModeAndState = (
    ponds: Pond[],
    latestMotorControlAck: LatestMotorAck[],
    latestModeChangeAck: LatestMotorAck[],
    latestLiveData: LatestLiveData[]
): any[] => {
    const applyAck = (ackArray: any, updateMode = false) => {
        const ack = Array.isArray(ackArray) ? ackArray[0] : ackArray;

        if (ack?.dev && Array.isArray(ack.dev)) {
            ack.dev.forEach((ackDevice: any) => {
                const { d_id: macAddress, ...motorData } = ackDevice;
                ponds.forEach((pond: Pond) => {
                    if (pond.motors && Array.isArray(pond.motors)) {
                        pond.motors.forEach((motor: Motor) => {
                            if (motor.starterBox?.mac_address === macAddress && motor.motor_ref_id) {
                                const motorRefId = motor.motor_ref_id;

                                if (motorData.hasOwnProperty(motorRefId)) {
                                    const value = motorData[motorRefId];
                                    if (updateMode) {
                                        motor.mode = getModeString(value);
                                    } else {
                                        motor.state = value === 1 ? 1 : 0;
                                    }
                                }
                            }
                        });
                    }
                });
            });
        }
    };

    const applyLiveData = (liveData: any) => {
        if (!liveData || !liveData.d_id || !Array.isArray(liveData.mtr)) return;

        const macAddress = liveData.d_id;
        const lineVoltages = liveData.ll_v || [null, null, null];

        ponds.forEach((pond: Pond) => {
            pond?.motors?.forEach((motor: Motor) => {
                if (motor.starterBox?.mac_address == macAddress && motor.motor_ref_id) {
                    const liveMotor = liveData.mtr.find((m: any) => {
                        const motorIndex = Number(
                            String(motor.motor_ref_id).replace(/[^\d]/g, "")
                        );
                        return motorIndex === Number(m.mtr_id);
                    });

                    if (liveMotor) {
                        motor.mode = getModeString(liveMotor.mode);
                        if (!motor.starterBoxParameters?.[0]) {
                            motor.starterBoxParameters = [{
                                id: 0,
                                starter_id: motor.starter_id || null,
                                motor_id: motor.id,
                                current_i1: null,
                                current_i2: null,
                                current_i3: null,
                                line_voltage_vry: null,
                                line_voltage_vyb: null,
                                line_voltage_vbr: null,
                                power_present: null,
                                fault_code: null
                            } as any];
                        }

                        if (Array.isArray(liveMotor.amp)) {
                            motor.starterBoxParameters[0].current_i1 = liveMotor.amp[0] ?? null;
                            motor.starterBoxParameters[0].current_i2 = liveMotor.amp[1] ?? null;
                            motor.starterBoxParameters[0].current_i3 = liveMotor.amp[2] ?? null;
                        }

                        motor.starterBoxParameters[0].line_voltage_vry = lineVoltages[0] ?? null;
                        motor.starterBoxParameters[0].line_voltage_vyb = lineVoltages[1] ?? null;
                        motor.starterBoxParameters[0].line_voltage_vbr = lineVoltages[2] ?? null;
                        motor.starterBoxParameters[0].power_present = liveData.pwr;

                        motor.faults = motor.faults || {};
                        motor.faults.fault_code = liveMotor.flt ?? null;
                        motor.mode = getModeString(liveMotor.mode || liveData.mode);
                        motor.state = liveMotor.mtr_sts === 1 ? 1 : 0;
                    }
                }
            });
        });
    };


    applyAck(latestMotorControlAck, false);
    applyAck(latestModeChangeAck, true);
    applyLiveData(latestLiveData);

    return ponds;
};

export const updateMotorsModeAndState2 = (
    allMotors: Motor[],
    latestMotorControlAck: LatestMotorAck[],
    latestModeChangeAck: LatestMotorAck[],
    latestLiveData: LatestLiveData[]
): any[] => {
    const applyAck = (ackArray: any, updateMode = false) => {
        const ack = Array.isArray(ackArray) ? ackArray[0] : ackArray;
        if (ack?.dev && Array.isArray(ack.dev)) {
            ack.dev.forEach((ackDevice: any) => {
                const { d_id: macAddress, ...motorData } = ackDevice;
                allMotors.forEach((motor: Motor) => {
                    if (motor.starterBox?.mac_address === macAddress && motor.motor_ref_id) {
                        const motorRefId = motor.motor_ref_id;

                        if (motorData.hasOwnProperty(motorRefId)) {
                            const value = motorData[motorRefId];
                            if (updateMode) {
                                motor.mode = getModeString(value);
                            } else {
                                motor.state = value === 1 ? 1 : 0;
                            }
                        }
                    }
                });
            });
        }
    };

    const applyLiveData = (liveData: any) => {
        if (!liveData || !liveData.d_id || !Array.isArray(liveData.mtr)) return;

        const macAddress = liveData.d_id;
        const lineVoltages = liveData.ll_v || [null, null, null];

        allMotors?.forEach((motor: Motor) => {
            if (motor.starterBox?.mac_address == macAddress && motor.motor_ref_id) {
                const liveMotor = liveData.mtr.find((m: any) => {
                    const motorIndex = Number(
                        String(motor.motor_ref_id).replace(/[^\d]/g, "")
                    );
                    return motorIndex === Number(m.mtr_id);
                });

                if (liveMotor) {
                    motor.mode = getModeString(liveMotor.mode);
                    if (!motor.starterBoxParameters?.[0]) {
                        motor.starterBoxParameters = [{
                            id: 0,
                            starter_id: motor.starter_id || null,
                            motor_id: motor.id,
                            current_i1: null,
                            current_i2: null,
                            current_i3: null,
                            line_voltage_vry: null,
                            line_voltage_vyb: null,
                            line_voltage_vbr: null,
                            power_present: null,
                            fault_code: null
                        } as any];
                    }

                    if (Array.isArray(liveMotor.amp)) {
                        motor.starterBoxParameters[0].current_i1 = liveMotor.amp[0] ?? null;
                        motor.starterBoxParameters[0].current_i2 = liveMotor.amp[1] ?? null;
                        motor.starterBoxParameters[0].current_i3 = liveMotor.amp[2] ?? null;
                    }

                    motor.starterBoxParameters[0].line_voltage_vry = lineVoltages[0] ?? null;
                    motor.starterBoxParameters[0].line_voltage_vyb = lineVoltages[1] ?? null;
                    motor.starterBoxParameters[0].line_voltage_vbr = lineVoltages[2] ?? null;
                    motor.starterBoxParameters[0].power_present = liveData.pwr;

                    motor.faults = motor.faults || {};
                    motor.starterBoxParameters[0].fault_code = liveMotor.flt ?? null;
                    motor.mode = getModeString(liveMotor.mode || liveData.mode);
                    motor.state = liveMotor.mtr_sts === 1 ? 1 : 0;
                }
            }
        });
    };


    applyAck(latestMotorControlAck, false);
    applyAck(latestModeChangeAck, true);
    applyLiveData(latestLiveData);

    return allMotors;
};