const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const app = express();

const server = http.createServer(app);
const io = socket(server); // realtime connection

const chess = new Chess();

let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs"); // ejs which is very similar to html.
app.use(express.static(path.join(__dirname, "public"))); // we are using static files images, vanilla javascript  and videos and css. 


app.get("/", (req, res) => {
  res.render("index", {title: "Chess Game"});
});


io.on("connection", function(uniquesocket){
  console.log("connected");

  if(!players.white){
    players.white = uniquesocket.id;  // create a white player
    uniquesocket.emit("playerRole", "w");  // this is event for who is just connect.
  }
  else if(!players.black){
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  }
  else {
    uniquesocket.emit("spectatorRole");
  }
  
  uniquesocket.on("disconnect", function () {
   if(uniquesocket.id === players.white){
    delete players.white;
   }
   else if(uniquesocket.id === players.black){
    delete players.black;
   }
  });

  uniquesocket.on("move", (move)=>{
    try{
      if(chess.turn() === 'w' && uniquesocket.id !== players.white) return;
      if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

      const result = chess.move(move);
      if(result){
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen()); 
        // fen() => FEN (Forsyth-Edwards Notation) in chess is a standard, single-line text format to describe any specific board position, capturing piece placement, whose turn it is, castling rights, en passant targets, half-moves, and full moves. 
      }
      else {
        console.log("Invalid Move :", move);
        uniquesocket.emit("invalid Move", move);
      }
    } catch(err) {
      console.log(err);
      uniquesocket.emit("Invalid Move :", move);
    }
  });
});


server.listen(3000, function (){
  console.log("listening on port 3000")
});
