import { MqttConnectionProvider } from "@/components/context/MqttConnectionContext";
import { AppSideBar } from "@/components/SideBar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
        <MqttConnectionProvider>
          <div className="font-inter">
            <AppSideBar />
          </div>
        </MqttConnectionProvider>
  );
} 