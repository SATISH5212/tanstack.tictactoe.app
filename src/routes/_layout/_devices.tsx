import AllDevices from '@/components/devices/AllDevices'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_devices')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="h-[92vh] overflow-hidden px-1 rounded-md">
    <AllDevices />
  </div>
}
