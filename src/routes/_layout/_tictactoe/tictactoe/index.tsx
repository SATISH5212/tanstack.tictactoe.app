import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_tictactoe/tictactoe/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div></div>
}
