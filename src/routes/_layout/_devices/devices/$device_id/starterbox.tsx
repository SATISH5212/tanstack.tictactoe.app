import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/_devices/devices/$device_id/starterbox',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/_devices/devices/$device_id/starterbox"!</div>
}
