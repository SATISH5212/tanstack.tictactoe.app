
import { useState, useEffect, useCallback, useMemo } from "react";
import mqtt from "mqtt";
import { v4 as uuidv4 } from "uuid";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL!;

export const useMQTTConnection = (isOpen: boolean) => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connectStatus, setConnectStatus] = useState<
    "Connected" | "Disconnected" | "Error"
  >("Disconnected");
  const [isConnected, setIsConnected] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, MQTT_OPTIONS]);

  return {
    client,
    connectStatus,
    isConnected,
  };
};
