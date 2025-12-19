import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_layout/_devices/devices/$device_id/_motors/motors/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div></div>
    )
}
