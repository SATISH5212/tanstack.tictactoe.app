import AllDevices from '@/components/devices/AllDevices'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_devices')({
  component: AllDevices,
})

