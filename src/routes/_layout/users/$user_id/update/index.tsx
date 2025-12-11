
import { UserForm } from '@/components/users/add'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/users/$user_id/update/')({
    component: UserForm,
})
