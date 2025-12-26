const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");


let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";


  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      // pattern 
      const squareElement = document.createElement("div");
      squareElement.classList.add("square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add("piece", square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        // allow drag only if player role matches
        pieceElement.draggable =
          playerRole !== null && playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (!pieceElement.draggable) return;

            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
        });

        pieceElement.addEventListener("dragged", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!draggedPiece || !sourceSquare) return;

        const targetSquare = {
          row: Number(squareElement.dataset.row),
          col: Number(squareElement.dataset.col),
        };

        handleMove(sourceSquare, targetSquare);
      });

      boardElement.appendChild(squareElement);
    });
  });

  // flip board for black
  if(playerRole === 'b'){
    boardElement.classList.add("flipped");
  }
  else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };
  
  socket.emit("move", move)
};

const getPieceUnicode = (piece)=> {
  const unicodePieces = {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
  };
  return unicodePieces[piece.type];
};

/* ---------------- Debugging ---------------- */

// console.log(chess.fen());  // rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

/* ---------------- SOCKET EVENTS ---------------- */

socket.on("playerRole", (role) => {
  playerRole = role; // 'w' or 'b'
  renderBoard();
});

socket.on("spectatorRole", function() {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", function(fen) {
  chess.move(fen);
  renderBoard();
});

socket.on("move", function(move) {
  chess.move(move);
  renderBoard();
});

renderBoard();



