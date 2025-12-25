import { BOARD_SIZE, WINNING_LINES } from "@/lib/constants/tictactoe";
import { Cell, GameState, Player } from "@/lib/interfaces/tictactoe";

export function createInitialState(): GameState {
    return {
        board: Array<Cell>(BOARD_SIZE).fill(null),
        currentPlayer: 'X',
        status: 'in-progress',
        winner: null,
    };
}

export function getWinner(board: Cell[]): Player | null {
    for (const [a, b, c] of WINNING_LINES) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

export function isDraw(board: Cell[], winner: Player | null): boolean {
    return board.every(cell => cell !== null) && winner === null;
}


export function applyMove(
    state: GameState,
    index: number
): GameState {
    if (state.status !== 'in-progress') return state;
    if (state.board[index] !== null) return state;

    const newBoard = state.board.map((cell, i) =>
        i === index ? state.currentPlayer : cell
    );

    const winner = getWinner(newBoard);
    const draw = isDraw(newBoard, winner);

    return {
        board: newBoard,
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
        status: winner ? 'won' : draw ? 'draw' : 'in-progress',
        winner: winner,
    };
}
