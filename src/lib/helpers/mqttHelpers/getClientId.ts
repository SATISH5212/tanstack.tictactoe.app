


import { v4 as uuidv4 } from "uuid";
export const getClientId = (): string => {
    const storedClientId = localStorage.getItem("mqtt_client_id");
    if (storedClientId) {
        return storedClientId;
    } else {
        const newClientId = `mqtt_react_${uuidv4()}`;
        localStorage.setItem("mqtt_client_id", newClientId);
        return newClientId;
    }
};