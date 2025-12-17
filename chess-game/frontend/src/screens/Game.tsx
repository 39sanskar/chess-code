import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";

const INIT_GAME = "init_game";
const MOVE = "move";
const GAME_OVER = "game_over";
const INVALID_MOVE = "invalid_move";

export const Game = () => {
  const socket = useSocket();

  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("SERVER MESSAGE:", message);

      switch (message.type) {
        case INIT_GAME:
          chess.reset();
          setBoard(chess.board());
          setStarted(true);
          break;

        case MOVE: {
          const move = message.payload?.move;
          if (!move) return;

          const result = chess.move(move);
          if (!result) return;

          setBoard(chess.board());
          break;
        }

        case INVALID_MOVE:
          alert(message.payload?.reason || "Invalid move");
          break;

        case GAME_OVER:
          alert(`Game Over! Winner: ${message.payload?.winner}`);
          break;
      }
    };
  }, [socket, chess]);

  if (!socket) {
    return <div className="text-white">Connecting...</div>;
  }

  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-4 w-full flex justify-center">
            <ChessBoard board={board} socket={socket} />
          </div>

          <div className="col-span-2 bg-slate-900 w-full flex justify-center">
            <div className="pt-8">
              {!started && (
                <Button
                  onClick={() =>
                    socket.send(JSON.stringify({ type: INIT_GAME }))
                  }
                >
                  Play
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
