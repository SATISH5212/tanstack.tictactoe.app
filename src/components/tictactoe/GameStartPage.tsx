import { IGameStartPageProps } from "@/lib/interfaces/tictactoe";
import { FC, useState } from "react";

const GameStartPage: FC<IGameStartPageProps> = ({
    setMode,
    setSelectedDifficulty,
}) => {
    const [showDifficulty, setShowDifficulty] = useState(false);

    const handlePVP = () => { setMode("PVP") };
    const handlePVAI = () => { setShowDifficulty(true) }

    const handleDifficultySelect = (difficulty: "easy" | "medium" | "hard") => {
        setSelectedDifficulty(difficulty);
        setMode("PVAI");
    };

    return (
        <div className="flex flex-col items-center gap-4 mt-20">
            <h2 className="text-xl font-semibold">Select Game Mode</h2>

            {!showDifficulty ? (
                <>
                    <button
                        className="px-6 py-2 bg-sky-500 text-white rounded"
                        onClick={handlePVP}
                    >
                        Player vs Player
                    </button>

                    <button
                        className="px-6 py-2 bg-green-500 text-white rounded"
                        onClick={handlePVAI}
                    >
                        Player vs AI
                    </button>
                </>
            ) : (
                <>
                    <h3 className="text-lg font-medium">Select Difficulty</h3>

                    <button
                        className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() => handleDifficultySelect("easy")}
                    >
                        Easy
                    </button>

                    <button
                        className="px-6 py-2 bg-yellow-400 rounded hover:bg-yellow-500"
                        onClick={() => handleDifficultySelect("medium")}
                    >
                        Medium
                    </button>

                    <button
                        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDifficultySelect("hard")}
                    >
                        Hard
                    </button>
                </>
            )}
        </div>
    );
};

export default GameStartPage;
