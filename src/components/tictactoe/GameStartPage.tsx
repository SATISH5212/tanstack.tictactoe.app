import { IGameStartPageProps } from "@/lib/interfaces/tictactoe";
import { FC } from "react";

const GameStartPage: FC<IGameStartPageProps> = (props) => {
    const { setMode } = props
    return (
        <div className="flex flex-col items-center gap-4 mt-20">
            <h2 className="text-xl font-semibold">Select Game Mode</h2>
            <button
                className="px-6 py-2 bg-sky-500 text-white rounded"
                onClick={() => setMode("PVP")}
            >
                Player vs Player
            </button>
            <button
                className="px-6 py-2 bg-green-500 text-white rounded"
                onClick={() => setMode("PVAI")}
            >
                Player vs AI
            </button>
        </div>
    );
}
export default GameStartPage