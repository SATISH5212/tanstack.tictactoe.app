import { createFileRoute, redirect } from '@tanstack/react-router'
const SampleProject = () => {
  return null
}
export const Route = createFileRoute('/')({
  component: SampleProject,
  beforeLoad: async () => {
    throw redirect({
      to: '/tictactoe',
    })
  },
})