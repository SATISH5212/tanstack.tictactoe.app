import DeviceGraphs from '@/lib/interfaces/devices/DeviceGraphs'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/_devices/devices/$device_id/_devicegraph',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <DeviceGraphs/>
  </div>
}
