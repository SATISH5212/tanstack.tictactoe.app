import LocationsAndGatewaysLayout from '@/components/usersModule/GatewaysLayout';

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/_layout/_locations")({
  component: LocationsAndGatewaysLayout ,
});


