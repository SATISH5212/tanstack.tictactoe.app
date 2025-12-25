import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div className='flex text-lg font-medium justify-center '>      TicTacToe    </div>
      <div><Outlet /></div>

    </div>

  )
}
