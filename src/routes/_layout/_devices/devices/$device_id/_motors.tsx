import MotorGraphs from '@/components/motors/MotorGraphs'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_layout/_devices/devices/$device_id/_motors',
)({
    component: MotorGraphs,
})
