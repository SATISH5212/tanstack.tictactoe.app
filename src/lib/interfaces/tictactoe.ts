import { Dispatch, SetStateAction } from "react";

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
export type GameMode = "PVP" | "PVAI";

export interface IGameStartPageProps {
    setMode: Dispatch<SetStateAction<GameMode | null>>;
    setSelectedDifficulty: Dispatch<SetStateAction<string>>
} 