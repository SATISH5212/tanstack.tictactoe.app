import DeviceDefaultSettings from '@/components/ponds/DeviceDefaultSettings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/_layout/default-settings/")({
  component: () => <DeviceDefaultSettings />,
});

