import { Cell, GameState, Player } from "@/lib/interfaces/tictactoe";
import { getWinner } from "./gameEngine";

export function getRandomAIMove(board: Cell[]): number | null {
    const emptyCellsAr = board
        .map((cell, index) => (cell === null ? index : null))
        .filter((v): v is number => v !== null);
    console.log(emptyCellsAr, "eee005")
    if (emptyCellsAr.length === 0) return null;

    return emptyCellsAr[Math.floor(Math.random() * emptyCellsAr.length)];
}

function findWinningMove(board: Cell[], player: Player): number | null {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            console.log(board, "findWinningMove001")
            const testBoard = board.map((c, idx) => {
                console.log(c, idx, "findWinningMove002")
                return idx === i ? player : c
            }
            );
            console.log(testBoard, "board001")
            if (getWinner(testBoard) === player) {
                return i;
            }
        }
    }
    return null;
}

export function getMediumMove(board: Cell[]): number | null {
    console.log(board, "medium001")
    const winMove = findWinningMove(board, "O");
    if (winMove !== null) return winMove;

    const blockMove = findWinningMove(board, "X");
    if (blockMove !== null) return blockMove;
    return getRandomAIMove(board);
}

function getHardMove(board: Cell[]): number | null {
    return null
}

export const diffucltyModeSelector = (selectedDiffuculty: string, game: GameState) => {
    switch (selectedDiffuculty) {
        case "easy":
            return getRandomAIMove(game.board)
        case "medium":
            return getMediumMove(game.board)
        case "hard":
            return getHardMove(game.board)
    }
}


