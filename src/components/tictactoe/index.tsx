import { useState } from "react";
import { Board } from "./Board";
import { handleBoxClick, createInitialGameState } from "@/lib/helpers/tictactoe/gameEngine";

const TicTacToe = () => {
    const [game, setGame] = useState(createInitialGameState());
    console.log(game, "gg001")
    const handleMove = (index: number) => {
        setGame(prev => handleBoxClick(prev, index))

    }
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <Board
                game={game}
                onMove={(i) => handleMove(i)}
            />

            <div className="text-lg">
                {game.status === 'won' && `Winner: ${game.winner}`}
                {game.status === 'draw' && 'Draw'}
                {game.status === 'in-progress' && `Turn: ${game.currentPlayer}`}
            </div>
        </div>
    );
}

export default TicTacToe;
