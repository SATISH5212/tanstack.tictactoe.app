import { useEffect, useState } from "react";
import { Board } from "./Board";
import {
    handleBoxClick,
    createInitialGameState,
} from "@/lib/helpers/tictactoe/gameEngine";

import { GameMode, GameState } from "@/lib/interfaces/tictactoe";
import { diffucltyModeSelector, getMediumMove, getRandomAIMove } from "@/lib/helpers/tictactoe/getRandomAIMove";
import GameStartPage from "./GameStartPage";



const TicTacToe = () => {
    const [mode, setMode] = useState<GameMode | null>(null);
    const [game, setGame] = useState<GameState>(createInitialGameState());
    const [isAiThinking, setIsAiThinking] = useState<boolean>(false)
    const [selectedDiffuculty, setSelectedDifficulty] = useState<string>("easy")

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
        setIsAiThinking(true)


        const timeout = setTimeout(() => {

            const aiMoveIndex = diffucltyModeSelector(selectedDiffuculty, game)
            console.log(aiMoveIndex, "eee003")

            if (aiMoveIndex && aiMoveIndex !== null) {
                setGame(prev => handleBoxClick(prev, aiMoveIndex));
            }
            setIsAiThinking(false)

        }, 3000);

        return () => clearTimeout(timeout);
    }, [game, mode]);




    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {!mode ? (
                <GameStartPage setMode={setMode} setSelectedDifficulty={setSelectedDifficulty} />
            ) : (
                <div>

                    <Board game={game} onMove={handleMove} />
                    {isAiThinking && <div className="text-lg">Oponent is thinking...</div>}

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
