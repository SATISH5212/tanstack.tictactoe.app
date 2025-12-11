import ViewUserDetails from '@/components/usersModule/profileDetails'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_viewprofile')({
  component: ViewUserDetails,
})

