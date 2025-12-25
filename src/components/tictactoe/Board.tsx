import { GameState } from "@/lib/interfaces/tictactoe";

interface Props {
    state: GameState;
    onMove: (index: number) => void;
}

export function Board({ state, onMove }: Props) {
    return (
        <div className="grid grid-cols-3 gap-2 w-64">
            {state.board.map((cell, i) => (
                <button
                    key={i}
                    onClick={() => onMove(i)}
                    className="h-20 text-3xl font-bold bg-white border rounded hover:bg-gray-100"
                >
                    {cell}  
                </button>
            ))}
        </div>
    );
}
