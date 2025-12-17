import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE, INVALID_MOVE } from "./messages.js";

export class Game {
  public player1: WebSocket; // WHITE
  public player2: WebSocket; // BLACK

  private chess: Chess;
  private turn: "w" | "b";

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;

    this.chess = new Chess();
    this.turn = "w";

    // Notify players
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "white" },
      })
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "black" },
      })
    );
  }

  makeMove(
    socket: WebSocket,
    move: { from: string; to: string }
  ) {
    //  Turn validation
    const isWhite = socket === this.player1;
    if (
      (this.turn === "w" && !isWhite) ||
      (this.turn === "b" && isWhite)
    ) {
      socket.send(JSON.stringify({
        type: INVALID_MOVE,
        payload: { reason: "Not your turn" }
      }));
      return;
    }

    let result;
    try {
      result = this.chess.move(move); // try move
    } catch (e) {
      // move threw an error
      socket.send(JSON.stringify({
        type: INVALID_MOVE,
        payload: { reason: "Illegal move" }
      }));
      return;
    }

    //  INVALID MOVE (chess.js returns null for illegal moves)
    if (!result) {
      socket.send(JSON.stringify({
        type: INVALID_MOVE,
        payload: { reason: "Illegal move" }
      }));
      return;
    }

    //  Switch turn
    this.turn = this.turn === "w" ? "b" : "w";

    //  Broadcast move to BOTH players
    const moveMessage = JSON.stringify({
      type: MOVE,
      payload: {
        move: {
          from: move.from,
          to: move.to,
        },
      },
    });

    this.player1.send(moveMessage);
    this.player2.send(moveMessage);

    //  Game over
    if (this.chess.isGameOver()) {
      const winner = this.chess.turn() === "w" ? "black" : "white";

      const gameOverMsg = JSON.stringify({
        type: GAME_OVER,
        payload: { winner },
      });

      this.player1.send(gameOverMsg);
      this.player2.send(gameOverMsg);
    }
  }
}
