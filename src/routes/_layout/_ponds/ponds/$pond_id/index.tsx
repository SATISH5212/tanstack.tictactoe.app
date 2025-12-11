import SinglePondPage from '@/components/dashboard/pondsTableView/singlePondPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_ponds/ponds/$pond_id/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (<SinglePondPage />)
}
