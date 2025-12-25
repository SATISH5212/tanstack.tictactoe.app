import { useEffect, useState } from "react";
import { Board } from "./Board";
import {
    handleBoxClick,
    createInitialGameState,
} from "@/lib/helpers/tictactoe/gameEngine";

import { GameMode, GameState } from "@/lib/interfaces/tictactoe";
import { getRandomAIMove } from "@/lib/helpers/tictactoe/getRandomAIMove";
import GameStartPage from "./GameStartPage";



const TicTacToe = () => {
    const [mode, setMode] = useState<GameMode | null>(null);
    const [game, setGame] = useState<GameState>(createInitialGameState());

    const handleMove = (index: number) => {
        console.log(mode, game, "bug001")
        if (mode === "PVAI" && game.currentPlayer === "O") return;

        setGame(prev => handleBoxClick(prev, index));
    };

    useEffect(() => {
        console.log("eee001", mode, game.status, game.currentPlayer)
        if (mode !== "PVAI" || game.status !== "in-progress" || game.currentPlayer !== "O") {
            return;
        }
        console.log("eee002", mode, game.status, game.currentPlayer)


        const timeout = setTimeout(() => {
            const aiMoveIndex = getRandomAIMove(game.board);
            console.log(aiMoveIndex,"eee003")

            if (aiMoveIndex !== null) {
                setGame(prev => handleBoxClick(prev, aiMoveIndex));
            }

        }, 600);

        return () => clearTimeout(timeout);
    }, [game, mode]);




    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {!mode ? (
                <GameStartPage setMode={setMode} />
            ) : (
                <div>
                    <Board game={game} onMove={handleMove} />

                    <div className="text-lg">
                        {game.status === "won" && `Winner: ${game.winner}`}
                        {game.status === "draw" && "Draw"}
                        {game.status === "in-progress" &&
                            `Turn: ${game.currentPlayer}`}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicTacToe;
