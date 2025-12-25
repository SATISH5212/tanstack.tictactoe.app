import { BOARD_SIZE, WINNING_LINES } from "@/lib/constants/tictactoe";
import { Cell, GameState, Player } from "@/lib/interfaces/tictactoe";

export function createInitialGameState(): GameState {
    return {
        board: Array<Cell>(BOARD_SIZE).fill(null),
        currentPlayer: 'X',
        status: 'in-progress',
        winner: null,
    };
}

export function getWinner(board: Cell[]): Player | null {
    for (const line of WINNING_LINES) {
        console.log(line, "testw001")

        const [a, b, c] = line;
        console.log(board[a], board[b], board[c], "testw002")

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
}


export function isDraw(board: Cell[], winner: Player | null): boolean {
    return board.every(cell => cell !== null) && winner === null;
}


export function handleBoxClick(
    state: GameState,
    index: number
): GameState {
    console.log("test001", state, index,)
    if (state.status !== 'in-progress') return state;
    if (state.board[index] !== null) return state;

    const newBoard = state.board.map((cell: Cell, i: number) => {
        console.log(cell, i, "test003")
        return i === index ? state.currentPlayer : cell
    }
    );
    console.log(newBoard, "test002")

    const winner = getWinner(newBoard);
    const draw = isDraw(newBoard, winner);

    return {
        board: newBoard,
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
        status: winner ? 'won' : draw ? 'draw' : 'in-progress',
        winner: winner,
    };
}
