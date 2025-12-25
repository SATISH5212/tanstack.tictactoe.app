export type Player = 'X' | 'O';
export type Cell = Player | null;
export type GameStatus = 'in-progress' | 'won' | 'draw';

export interface GameState {
    board: Cell[];
    currentPlayer: Player;
    status: GameStatus;
    winner: Player | null;
}

export interface ITicTacToeProps {
    state: GameState;
    onMove: (index: number) => void;
}