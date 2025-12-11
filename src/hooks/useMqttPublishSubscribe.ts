import { GatewayMQTTHelperOptions, GatewayMQTTHelperReturn, LatestLiveData, LatestMotorAck } from "@/lib/interfaces/mqtt/motor";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const useMqttPublishSubscribe = ({
    client,
    isConnected,
    onSubscriptionSuccess,
    onSubscriptionError,
}: GatewayMQTTHelperOptions): GatewayMQTTHelperReturn => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [latestMotorControlAck, setLatestMotorControlAck] = useState<LatestMotorAck[]>([]);
    const [latestLiveData, setLatestLiveData] = useState<LatestLiveData[]>([]);
    const [latestModeChangeAck, setLatestModeChangeAck] = useState<LatestMotorAck[]>([]);

    const queryClient = useQueryClient();
    const isSubscribedRef = useRef(false);
    const messageHandlerRef = useRef<((topic: string, message: Buffer) => void) | null>(null);


    const subscribeTopics = useMemo(
        () => [
            "gateways/+/devices/motor_control/ack",
            "gateways/+/devices/mode_change/ack",
            "gateways/+/devices/live_data",
        ], []);

    const decodeMessage = useCallback((message: Buffer): any => {
        try {
            const messageStr = message.toString("utf8");
            return JSON.parse(messageStr);
        } catch (error) {
            console.error("Error decoding message:", error);
            return null;
        }
    }, []);

    const subscribeToGatewayTopics = useCallback(() => {

        if (!client || !isConnected) {
            toast.error("MQTT client not connected");
            return;
        }

        if (isSubscribedRef.current && messageHandlerRef.current) {
            client.off("message", messageHandlerRef.current);
            messageHandlerRef.current = null;
        }

        subscribeTopics.forEach((topic) => {
            client.subscribe(topic, { qos: 1 }, (err: Error) => {
                if (err) {
                    // toast.error(`Failed to subscribe to ${topic}`);
                    onSubscriptionError?.(err);
                }
            });
        });

        isSubscribedRef.current = true;
        setIsSubscribed(true);
        onSubscriptionSuccess?.();
    }, [client, isConnected, subscribeTopics, onSubscriptionSuccess, onSubscriptionError]);

    const unsubscribeFromGatewayTopics = useCallback(() => {
        if (!client || !isSubscribedRef.current) return;
        if (client.connected) {
            subscribeTopics.forEach((topic) => {
                client.unsubscribe(topic, (err: Error) => {
                    if (err) {
                        console.error(`Error unsubscribing from ${topic}:`, err);
                    }
                });
            });
        }

        if (messageHandlerRef.current) {
            client.off("message", messageHandlerRef.current);
            messageHandlerRef.current = null;
        }

        isSubscribedRef.current = false;
        setIsSubscribed(false);
    }, [client, subscribeTopics]);

    useEffect(() => {
        if (!client || !isSubscribed) return;


        const messageHandler = (topic: string, message: Buffer) => {
            const data = decodeMessage(message)
            if (!data) return;

            if (topic.includes("/motor_control/ack")) {
                setLatestMotorControlAck(data);
            } else if (topic.includes("/live_data")) {
                setLatestLiveData(data);
            } else if (topic.includes("/mode_change/ack")) {
                setLatestModeChangeAck(data);
            }
        };

        messageHandlerRef.current = messageHandler;
        client.on("message", messageHandler);

        return () => {
            if (messageHandlerRef.current) {
                client.off("message", messageHandlerRef.current);
                messageHandlerRef.current = null;
            }
        };
    }, [
        client,
        isSubscribed,
        decodeMessage,
        queryClient,
    ]);

    const handleMotorContorlPublish = useCallback((data: any[]) => {
        if (!client || !isConnected) {
            toast.error("MQTT client not connected");
            return;
        }

        const validMotors = data.filter(
            (m) =>
                m?.mac_address &&
                m?.motor_ref_id &&
                m?.gateway?.title
        );

        if (validMotors.length === 0) {
            toast.error("No valid motors to publish");
            return;
        }
        const gatewayGroups: Record<string, any[]> = {};
        const grouped: Record<string, any> = {};
        validMotors.forEach((m: any) => {
            const mac = m.mac_address;
            if (!grouped[mac]) grouped[mac] = { d_id: mac };
            grouped[mac][m.motor_ref_id] = m.newState === 1 ? 1 : 0;
        });
        const payload = { dev: Object.values(grouped) };
        setLatestMotorControlAck([payload] as any);


        validMotors.forEach((motor) => {
            const gtwTitle = motor.gateway.title;

            if (!gatewayGroups[gtwTitle]) {
                gatewayGroups[gtwTitle] = [];
            }
            gatewayGroups[gtwTitle].push(motor);
        });

        Object.entries(gatewayGroups).forEach(([gatewayTitle, motors]) => {
            const macGrouped: Record<string, any> = {};

            motors.forEach((m) => {
                const mac = m.mac_address;

                if (!macGrouped[mac]) {
                    macGrouped[mac] = { d_id: mac };
                }

                macGrouped[mac][m.motor_ref_id] = m.newState === 1 ? 1 : 0;
            });

            const payload = { dev: Object.values(macGrouped) };
            const publishTopic = `gateways/${gatewayTitle}/devices/motor_control`;

            client.publish(
                publishTopic,
                JSON.stringify(payload),
                { qos: 1 },
                (err: any) => {
                    if (err) {
                        console.error("MQTT Publish Error:", err);
                        toast.error(`Failed to publish to ${gatewayTitle}`);
                    }
                }
            );
        });

    }, [client, isConnected]);

    const handleMotorModePublish = useCallback((data: any[]) => {
        if (!client || !isConnected) {
            toast.error("MQTT client not connected");
            return;
        }
        const validMotors = data.filter(
            (m) =>
                m?.mac_address &&
                m?.motor_ref_id &&
                m?.gateway?.title
        );

        if (validMotors.length === 0) {
            toast.error("No valid motors to publish mode change");
            return;
        }
        const gatewayGroups: Record<string, any[]> = {};
        const grouped: Record<string, any> = {};

        validMotors.forEach((m: any) => {
            const mac = m.mac_address;
            if (!grouped[mac]) grouped[mac] = { d_id: mac };
            grouped[mac][m.motor_ref_id] = m.newMode;
        });
        const payload = { dev: Object.values(grouped) };
        setLatestModeChangeAck([payload] as any);
        validMotors.forEach((motor) => {
            const gtwTitle = motor.gateway.title;
            if (!gatewayGroups[gtwTitle]) {
                gatewayGroups[gtwTitle] = [];
            }
            gatewayGroups[gtwTitle].push(motor);
        });
        Object.entries(gatewayGroups).forEach(([gatewayTitle, motors]) => {
            const macGrouped: Record<string, any> = {};

            motors.forEach((m) => {
                const mac = m.mac_address;

                if (!macGrouped[mac]) {
                    macGrouped[mac] = { d_id: mac };
                }
                macGrouped[mac][m.motor_ref_id] = m.newMode;
            });

            const payload = { dev: Object.values(macGrouped) };


            const publishTopic = `gateways/${gatewayTitle}/devices/mode_change`;

            client.publish(
                publishTopic,
                JSON.stringify(payload),
                { qos: 1 },
                (err: any) => {
                    if (err) {
                        console.error("MQTT MODE Publish Error:", err);
                        toast.error(`Mode publish failed on ${gatewayTitle}`);
                    }
                }
            );
        });

    }, [client, isConnected]);

    return {
        isSubscribed,
        latestMotorControlAck,
        latestLiveData,
        latestModeChangeAck,
        subscribeToGatewayTopics,
        unsubscribeFromGatewayTopics,
        handleMotorContorlPublish,
        handleMotorModePublish
    };
};