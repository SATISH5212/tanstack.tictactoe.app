import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_devices/devices/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div></div>
}
