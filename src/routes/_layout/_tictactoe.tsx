
import TicTacToe from '@/components/tictactoe'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_tictactoe')({
    component: TicTacToe,
})

