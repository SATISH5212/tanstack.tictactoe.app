import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/_users/users/$user_id/_ponds/ponds/$pond_id/motors/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div></div>
}
