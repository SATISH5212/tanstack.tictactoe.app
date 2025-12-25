import { useState } from "react";
import { Board } from "./Board";
import { applyMove, createInitialState } from "@/lib/helpers/tictactoe/gameEngine";

const TicTacToe = () => {
    const [state, setState] = useState(createInitialState());

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Board
                state={state}
                onMove={(i) => setState(prev => applyMove(prev, i))}
            />

            <div className="text-lg">
                {state.status === 'won' && `Winner: ${state.winner}`}
                {state.status === 'draw' && 'Draw'}
                {state.status === 'in-progress' && `Turn: ${state.currentPlayer}`}
            </div>
        </div>
    );
}

export default TicTacToe;
