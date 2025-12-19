import { LoginPage } from '@/components/auth/login'
import { authMiddleware } from 'src/lib/helpers/middleware'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: LoginPage,
  beforeLoad: authMiddleware
})

