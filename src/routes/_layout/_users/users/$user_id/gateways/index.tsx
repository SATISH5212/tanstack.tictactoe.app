
import { GatewayColumn } from '@/components/users/GatewayColumn'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/_users/users/$user_id/gateways/',
)({
  component: GatewayColumn,
})

