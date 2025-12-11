import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/_locations/locations/$location_id/gateways/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_layout/_locations/locations/$location_id/gateways/"!</div>
  )
}
