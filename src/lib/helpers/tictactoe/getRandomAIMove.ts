import { Cell } from "@/lib/interfaces/tictactoe";

export function getRandomAIMove(board: Cell[]): number | null {
    const emptyCellsAr = board
        .map((cell, index) => (cell === null ? index : null))
        .filter((v): v is number => v !== null);
    console.log(emptyCellsAr, "eee005")
    if (emptyCellsAr.length === 0) return null;

    return emptyCellsAr[Math.floor(Math.random() * emptyCellsAr.length)];
}