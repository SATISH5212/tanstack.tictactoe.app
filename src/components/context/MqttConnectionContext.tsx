import mqtt, { IClientOptions, MqttClient } from "mqtt";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { getClientId } from "@/lib/helpers/map/mqttHelpers/getClientId";
import { useLocation } from "@tanstack/react-router";

export interface MqttConnection {
    client: MqttClient | null;
    connectStatus: "Connected" | "Disconnected" | "Error";
    isConnected: boolean;
}
const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL!;

interface MqttConnectionContextType {
    client: MqttClient | null;
    isConnected: boolean;
}
const MqttConnectionContext = createContext<MqttConnectionContextType>({
    client: null,
    isConnected: false,
});

interface MqttConnectionProviderProps {
    children: ReactNode;
}

export const useMqttConnectionContext = () => useContext(MqttConnectionContext);

export const MqttConnectionProvider = ({
    children,
}: MqttConnectionProviderProps) => {
    const [connection, setConnection] = useState<MqttConnection>({
        client: null,
        connectStatus: "Disconnected",
        isConnected: false,
    });
    const clientRef = useRef<MqttClient | null>(null);
    const location = useLocation();

    const clientId = useRef<string | null>(null);
    if (!clientId.current) {
        clientId.current = getClientId();
    }

    const mqttOptions = useRef<IClientOptions>({
        username: import.meta.env.VITE_MQTT_USERNAME,
        password: import.meta.env.VITE_MQTT_PASSWORD,
        clientId: clientId.current,
        keepalive: 60,
        reconnectPeriod: 0,
        connectTimeout: 10000,
        clean: true,
        rejectUnauthorized: false,
    }).current;

    const cleanup = useCallback(() => {
        if (clientRef.current) {
            const client = clientRef.current;
            client.removeAllListeners();
            client.end(true, {}, () => { });
            clientRef.current = null;
        }

        setConnection({
            client: null,
            connectStatus: "Disconnected",
            isConnected: false,
        });
    }, []);

    const connect = useCallback(() => {
        if (clientRef.current?.connected) {
            return;
        }

        if (!BROKER_URL) {
            setConnection((prev) => ({
                ...prev,
                connectStatus: "Error",
                isConnected: false,
            }));
            return;
        }

        try {
            const mqttClient = mqtt.connect(BROKER_URL, mqttOptions);
            clientRef.current = mqttClient;

            mqttClient.on("connect", () => {
                setConnection({
                    client: mqttClient,
                    connectStatus: "Connected",
                    isConnected: true,
                });
            });

            mqttClient.on("error", (err) => {
                console.error("MQTT connection error:", err);
                setConnection((prev) => ({
                    ...prev,
                    connectStatus: "Error",
                    isConnected: false,
                }));
            });

            mqttClient.on("close", () => {
                setConnection((prev) => ({
                    ...prev,
                    connectStatus: "Disconnected",
                    isConnected: false,
                }));
            });

            mqttClient.on("offline", () => {
                setConnection((prev) => ({
                    ...prev,
                    connectStatus: "Disconnected",
                    isConnected: false,
                }));
            });
        } catch (error) {
            console.error("Failed to create MQTT connection:", error);
            setConnection((prev) => ({
                ...prev,
                connectStatus: "Error",
                isConnected: false,
            }));
        }
    }, [BROKER_URL, mqttOptions]);

    useEffect(() => {
        const shouldPreserveConnection =
            location.pathname.includes("/ponds") ||
            location.pathname.includes("/dashboard");

        if (shouldPreserveConnection && !clientRef.current?.connected) {
            connect();
        } else if (!shouldPreserveConnection && clientRef.current) {
            cleanup();

        }
    }, [location.pathname, connect, cleanup]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return (
        <MqttConnectionContext.Provider
            value={{
                client: connection.client,
                isConnected: connection.isConnected,
            }}
        >
            {children}
        </MqttConnectionContext.Provider>
    );
};
