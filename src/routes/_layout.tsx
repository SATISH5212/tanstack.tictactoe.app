import { MqttConnectionProvider } from "@/components/context/MqttConnectionContext";
import { AppSideBar } from "@/components/SideBar";
import { createFileRoute } from "@tanstack/react-router";
import { LocationProvider } from "@/components/context/LocationContext";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
        <LocationProvider>
        <MqttConnectionProvider>
          <div className="font-inter">
            <AppSideBar />
          </div>
        </MqttConnectionProvider>
        </LocationProvider>
  );
} 