import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_users/users/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div></div>
}
