import { useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import {
    handleBoxClick,
    createInitialGameState,
} from "@/lib/helpers/tictactoe/gameEngine";
import { GameMode, GameState } from "@/lib/interfaces/tictactoe";
import { diffucltyModeSelector } from "@/lib/helpers/tictactoe/getRandomAIMove";
import GameStartPage from "./GameStartPage";

const TicTacToe = () => {
    const [mode, setMode] = useState<GameMode | null>(null);
    const [game, setGame] = useState<GameState>(createInitialGameState());
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [selectedDiffuculty, setSelectedDifficulty] = useState("easy");

    const historyRef = useRef<GameState[]>([]);
    const redoRef = useRef<GameState[]>([]);

    const handleMove = (index: number) => {
        if (mode === "PVAI" && game.currentPlayer === "O") return;

        const nextState = handleBoxClick(game, index)
        console.log(nextState, "nex001");

        if (nextState === game) return;

        historyRef.current.push(game);
        redoRef.current = [];

        setGame(nextState);
    };

    useEffect(() => {
        if (
            mode !== "PVAI" ||
            game.status !== "in-progress" ||
            game.currentPlayer !== "O"
        ) {
            return;
        }

        setIsAiThinking(true);

        const timeout = setTimeout(() => {
            const aiMoveIndex = diffucltyModeSelector(selectedDiffuculty, game);

            if (aiMoveIndex && aiMoveIndex !== null) {
                historyRef.current.push(game);
                redoRef.current = [];

                setGame(handleBoxClick(game, aiMoveIndex));
            }

            setIsAiThinking(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [game, mode, selectedDiffuculty]);


    const handleUndo = () => {
        if (historyRef.current.length === 0) return;

        const previousState = historyRef.current.pop()!;
        redoRef.current.push(game);

        setGame(previousState);
    };

    const handleRedo = () => {
        if (redoRef.current.length === 0) return;

        const nextState = redoRef.current.pop()!;
        historyRef.current.push(game);

        setGame(nextState);
    };

    const canUndo = historyRef.current.length > 0;
    const canRedo = redoRef.current.length > 0;

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {!mode ? (
                <GameStartPage
                    setMode={setMode}
                    setSelectedDifficulty={setSelectedDifficulty}
                />
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <Board game={game} onMove={handleMove} />

                    {isAiThinking && (
                        <div className="text-lg">Opponent is thinking…</div>
                    )}

                    <div className="text-lg">
                        {game.status === "won" && `Winner: ${game.winner}`}
                        {game.status === "draw" && "Draw"}
                        {game.status === "in-progress" &&
                            `Turn: ${game.currentPlayer}`}
                    </div>

                    {/* Undo / Redo */}
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={handleUndo}
                            disabled={!canUndo}
                            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                        >
                            Undo
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={!canRedo}
                            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                        >
                            Redo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicTacToe;
