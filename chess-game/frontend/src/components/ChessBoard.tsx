import type { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";

type BoardSquare = {
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null;

type Props = {
  board: BoardSquare[][];
  socket: WebSocket | null;
};

export const ChessBoard = ({ board, socket }: Props) => {
  const [from, setFrom] = useState<Square | null>(null);

  const MOVE = "move"; // define locally

  if (!socket) return null; // guard against null socket

  return (
    <div>
      {board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((square, j) => {
            const squareRepresentation =
              (String.fromCharCode(97 + j) + (8 - i)) as Square;

            return (
              <div
                key={j}
                className={`w-16 h-16 flex items-center justify-center cursor-pointer
                  ${(i + j) % 2 === 0 ? "bg-green-500" : "bg-white"}
                `}
                onClick={() => {
                  // select FROM
                  if (!from) {
                    if (!square) return;
                    setFrom(squareRepresentation);
                    return;
                  }

                  // send MOVE to server safely
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.send(
                      JSON.stringify({
                        type: MOVE,
                        payload: { move: { from, to: squareRepresentation } },
                      })
                    );
                  }

                  setFrom(null);
                }}
              >
                {square && (
                  <img
                    className="w-8 h-8"
                    src={`/${square.color}${square.type}.png`}
                    alt={`${square.color}${square.type}`}
                    draggable={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
