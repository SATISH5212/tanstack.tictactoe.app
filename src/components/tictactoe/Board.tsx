import { GameState } from "@/lib/interfaces/tictactoe";

interface Props {
    game: GameState;
    onMove: (index: number) => void;
}

export function Board({ game, onMove }: Props) {
    console.log(game, "satis001")
    return (
        <div className="grid grid-cols-3 gap-2 w-64">
            {game.board.map((box, i) => (
                <button
                    key={i}
                    onClick={() => onMove(i)}
                    className="h-20 text-3xl font-medium bg-sky-200 border rounded-md hover:bg-sky-300"
                >
                    {box}
                </button>
            ))}
        </div>
    );
}
