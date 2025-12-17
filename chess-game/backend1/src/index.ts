// ws in node.js
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager.js";

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

wss.on("connection", (ws) => {
  gameManager.addUser(ws);

  ws.on("close", () => {
    gameManager.removeUser(ws);
  });
});

console.log("WebSocket server running on ws://localhost:8080");
