import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages.js";
import { Game } from "./Game.js";

export class GameManager {
  private games: Game[] = [];
  private pendingUser: WebSocket | null = null;
  private users: WebSocket[] = [];

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandlers(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter(user => user !== socket);

    // Remove pending user if disconnected
    if (this.pendingUser === socket) {
      this.pendingUser = null;
    }

    // Remove games involving this socket
    this.games = this.games.filter(
      game => game.player1 !== socket && game.player2 !== socket
    );
  }

  private addHandlers(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      // INIT GAME
      if (message.type === INIT_GAME) {
        if (this.pendingUser && this.pendingUser !== socket) {
          const game = new Game(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = socket;
        }
      }

      // MOVE
      if (message.type === MOVE) {
        const game = this.games.find(
          game => game.player1 === socket || game.player2 === socket
        );

        if (game) {
          game.makeMove(socket, message.payload.move);
        }
      }
    });

    //  HANDLE DISCONNECT
    socket.on("close", () => {
      this.removeUser(socket);
    });
  }
}
